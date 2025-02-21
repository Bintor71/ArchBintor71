"use strict";

const init = async () => {
  startHandlingWindowMessages();
  await sendMessage({
    type: MESSAGE_TYPES.getPageDataForContentRequest,
    payload: {
      url: location.href,
      isMainFrame: window === window.top
    }
  });
};
init().catch(e => {
  debug.error('Error in init', e.message);
});
async function getPageLoadTime() {
  const [{
    domInteractive,
    domComplete
  }] = performance.getEntriesByType('navigation');
  await sendMessage({
    type: MESSAGE_TYPES.getPageLoadTime,
    payload: {
      ms: domInteractive - domComplete
    }
  });
}
if (window.top === window) {
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
      setTimeout(getPageLoadTime, 0);
    }
    if (document.readyState === 'complete') {
      if (pageData.enabled) {
        applyExtendedRules(extendedRules);
        const debouncedApplyExtendedRules = debounce(applyExtendedRules, 100);
        observeDomChanges(() => {
          debouncedApplyExtendedRules(extendedRules);
        });
      }
    }
  });
}