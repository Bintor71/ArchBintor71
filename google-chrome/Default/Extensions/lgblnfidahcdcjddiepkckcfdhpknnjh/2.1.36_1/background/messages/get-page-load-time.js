"use strict";

function actionInCaseGetPageLoadTime({
  payload
}, sender) {
  const tabId = sender?.tab?.id;
  if (typeof tabId !== 'number') {
    return;
  }
  const pageData = pageDataComponent.getData(tabId);
  if (pageData) {
    const factor = (pageData.timeSavingBlocks || 0) * 250;
    statisticsComponent.pageLoadCompleted(parseFloat((payload.ms / 1000).toFixed(2)), parseFloat(((1 + factor / payload.ms) * factor / 1000).toFixed(2)));
  }
}