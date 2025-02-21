"use strict";

async function applyNewSettingsOnTab(tabId) {
  await pageDataComponent.refresh(tabId);
  await iconComponent.updateIcon();
  const frames = (await getAllFrames(tabId)) || [];
  for (const {
    url,
    frameId
  } of frames) {
    const frameData = pageDataComponent.getFramePageData({
      tabId,
      frameId,
      frameUrl: url
    });
    if (frameData) {
      await sendMessageToTab(tabId, {
        type: MESSAGE_TYPES.updatePageData,
        payload: {
          pageData: frameData
        }
      }, {
        frameId
      });
    }
  }
}