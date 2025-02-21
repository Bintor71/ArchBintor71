"use strict";

const currentWindow = window;
const currentDocument = currentWindow.document;
const iframeGuid = createGuid();
let pageData = {};
let extendedRules = [];
async function updatePageData(data) {
  const previousPageData = {
    ...pageData
  };
  pageData = data;
  await setPageCss();
  if (pageData.blockPopups && !previousPageData.blockPopups) {
    blockPopups(pageData.showBlockedPopupNotification ?? true);
  }
  if (!pageData.blockPopups && previousPageData.blockPopups) {
    stopBlockingPopups();
  }
}
function elementHasAdHints(element) {
  const adHintRegex = /((^|\s|_|\.|-)([aA][dD]([sS])?|[a-zA-Z]*Ad(s)?|adtech|adtag|dfp|darla|adv|advertisement|([bB])anner|adsbygoogle|adwrap|adzerk|safeframe|300[xX]250|160[xX]600|728[xX]90)(\s|$|_|\.|-|[A-Z0-9]))/;
  return element.id.match(adHintRegex) || element?.getAttribute('class')?.match(adHintRegex);
}
function isContainingContent(element) {
  const adChoicesIcon = /(adchoices)/i;
  const elementText = element.innerText;
  if (elementText && (elementText.length > 30 || elementText.length <= 30 && elementText.length >= 3 && !/((^|\s)(([aA][dD]\s)|advertisement|sponsored|реклама))/i.test(elementText))) return true;
  for (let image of element.getElementsByTagName('img')) {
    const imageStyle = getComputedStyle(image);
    const isHidden = imageStyle.visibility === 'hidden' || imageStyle.display === 'none';
    if (!isHidden && image.clientWidth * image.clientHeight > 100 && !adChoicesIcon.test(image.src)) return true;
  }
  return false;
}
function hideAllRelevantElements(doc) {
  const containerElementTags = ['iframe', 'div', 'section', 'td', 'ins'];
  for (let tagName of containerElementTags) {
    for (let element of doc.getElementsByTagName(tagName)) {
      if (elementHasAdHints(element) && element.clientWidth * element.clientHeight > 1000 && !isContainingContent(element) && element.children.length > 0) {
        element.setAttribute('style', `display: none !important;${element.getAttribute?.('style') || ''}`);
      }
    }
  }
}
function addElementToHead(element) {
  if (document.head) {
    document.head.insertBefore(element, document.head.firstChild);
  } else {
    window.setTimeout(() => {
      addElementToHead(element);
    }, 10);
  }
}
async function getEasylistCss(data) {
  const storedData = await storageService.get('easylistCssValue');
  const {
    extended_rules = {},
    blacklist = {},
    whitelist = {}
  } = storedData?.css_rules || {};
  const host = data.hostAddress || '';
  addDomainToLists(host, blacklist, whitelist, extended_rules);
  if (extended_rules[host]) {
    extendedRules = extended_rules[host].map(extendedRuleParser.parse.bind(extendedRuleParser));
  }
  const currentPageEasylistCss = [];
  let allCss = [];
  if (blacklist['*']) {
    allCss = blacklist['*'];
  }
  if (blacklist[host]) {
    currentPageEasylistCss.push(...blacklist[host]);
  }
  if (whitelist[host]) {
    allCss = allCss.filter(val => !whitelist[host].includes(val));
  }
  return [...currentPageEasylistCss, ...allCss];
}
function addDomainToLists(host, blacklist, whitelist, extended_rules) {
  const domains = [];
  const domainParts = host.split('.');
  for (let i = 0; i < domainParts.length - 1; i++) {
    domains.push(domainParts.slice(i).join('.'));
  }
  const domainsInBlackList = domains.filter(domain => blacklist.hasOwnProperty(domain));
  const domainInWhiteList = domains.find(domain => whitelist.hasOwnProperty(domain));
  const domainsInExtendedRules = domains.filter(domain => extended_rules.hasOwnProperty(domain));
  if (domainsInBlackList.length > 0) {
    blacklist[host] = blacklist[host] ?? [];
    domainsInBlackList.forEach(domain => {
      blacklist[host].push(...blacklist[domain]);
    });
    blacklist[host] = Array.from(new Set(blacklist[host]));
  }
  if (domainInWhiteList) {
    whitelist[host] = whitelist[domainInWhiteList];
  }
  if (domainsInExtendedRules.length > 0) {
    extended_rules[host] = extended_rules[host] ?? [];
    domainsInExtendedRules.forEach(domain => {
      extended_rules[host].push(...extended_rules[domain]);
    });
    extended_rules[host] = Array.from(new Set(extended_rules[host]));
  }
}
async function stopTrackingFrames() {
  const trackers = await storageService.get('trackersListValue');
  if (trackers) {
    const iframes = currentDocument.getElementsByTagName('iframe');
    for (const iframe of iframes) {
      for (const tracker of trackers) {
        if (iframe.src.includes(tracker)) {
          iframe.remove();
          break;
        }
      }
    }
  }
}
async function setPageData(data) {
  pageData = data;
  if (pageData.enabled) {
    await setPageCss();
  }
  if (pageData.blockPopups) {
    blockPopups(pageData.showBlockedPopupNotification ?? true);
  }
  if (pageData.blockTracking) {
    await stopTrackingFrames();
  }
}
async function setPageCss() {
  try {
    setCustomCssIntoPage(pageData.customCss);
    const css = await getEasylistCss(pageData);
    const countPerStyle = 2500;
    const styleElementIds = [];
    currentDocument.querySelectorAll('style[id^="stndz-css-"]').forEach(style => style.remove());
    for (let i = 0; i < Math.ceil(css.length / countPerStyle); i++) {
      const id = `stndz-css-${i}`;
      const styleElement = currentDocument.createElement('style');
      styleElement.id = id;
      styleElement.textContent = `${css.slice(countPerStyle * i, countPerStyle * i + countPerStyle).join(', ')} ${BLOCK_CSS_VALUE}`;
      addElementToHead(styleElement);
      styleElementIds.push(id);
    }
    addStyleRulesToShadowDomNodes(styleElementIds);
  } catch (e) {
    debug.error('Error in setPageCss', e);
  }
}