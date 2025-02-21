"use strict";

async function getTabIdsByHost(host) {
  const tabs = await queryTabs();
  return tabs.filter(tab => tab.url && host === getUrlHost(tab.url) && typeof tab.id === 'number').map(tab => tab.id);
}
async function reloadTabsByHost(host) {
  const ids = await getTabIdsByHost(host);
  ids.forEach(reloadTab);
}
async function reloadTab(tabId) {
  try {
    return await browser.tabs.reload(tabId);
  } catch (e) {
    debug.error('Error in reloadTab', {
      tabId,
      e
    });
  }
}
async function getTab(tabId) {
  try {
    return await browser.tabs.get(tabId);
  } catch (e) {
    debug.error('Error in getTab', {
      tabId,
      e
    });
    return null;
  }
}
async function queryTabs(filter = {}) {
  try {
    return await browser.tabs.query(filter);
  } catch (e) {
    debug.error('Error in queryTabs', {
      filter,
      e
    });
    return [];
  }
}
async function openTabWithUrl(url) {
  try {
    return await browser.tabs.create({
      url,
      active: true
    });
  } catch (e) {
    debug.error('Error in openTabWithUrl', {
      url,
      e
    });
    return null;
  }
}
async function sendMessageToTab(tabId, message, options = {}) {
  try {
    await browser.tabs.sendMessage(tabId, message, options);
  } catch (e) {
    debug.error('Error in sendMessageToTab', {
      tabId,
      message,
      options,
      e
    });
  }
}
async function executeScriptOnTab(tabId, details) {
  const tab = await getTab(tabId);
  if (tab?.status !== 'complete') {
    return [];
  }
  const extensionsUrl = browserInfo.getExtensionsUrl();
  const browserStoreUrl = browserInfo.getBrowserStoreUrl();
  if (extensionsUrl && tab.url?.startsWith(extensionsUrl) || browserStoreUrl && tab.url?.startsWith(browserStoreUrl) || !tab.url?.startsWith('http')) {
    return [];
  }
  const d = {
    target: {
      tabId,
      allFrames: details.allFrames
    }
  };
  if (details.func) {
    d.func = details.func;
    d.args = details.args;
  }
  if (details.files) {
    d.files = details.files;
  }
  try {
    const results = await browser.scripting.executeScript(d);
    return results.map(r => r.result);
  } catch (error) {
    debug.error('Error in executeScriptOnTab', {
      details,
      error
    });
    return [];
  }
}