"use strict";

async function actionInCaseGetPageDataForContent({
  payload: {
    url,
    isMainFrame
  }
}, {
  tab,
  frameId
} = {}) {
  if (typeof tab?.id === 'number') {
    const frameData = pageDataComponent.getFramePageData({
      tabId: tab.id,
      frameId,
      frameUrl: url,
      isMainFrame
    });
    if (frameData) {
      await sendMessageToTab(tab.id, {
        type: MESSAGE_TYPES.getPageDataForContentResponse,
        payload: {
          pageData: frameData
        }
      }, {
        frameId
      });
    }
  }
}