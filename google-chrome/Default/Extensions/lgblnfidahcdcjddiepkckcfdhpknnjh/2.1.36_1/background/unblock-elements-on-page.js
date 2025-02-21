"use strict";

async function unblockElementsOnPage(tabId, showNotification) {
  const pageData = pageDataComponent.getData(tabId);
  if (!pageData?.hostAddress) {
    return;
  }
  if (showNotification) {
    const elementsCount = await customCssRules.countRulesOnTab(tabId);
    await notificationsComponent.showUnblockNotification(elementsCount);
  }
  await customCssRules.removeAllRulesByHost(pageData.hostAddress);
  await pageDataComponent.refresh(tabId);
  await sendMessageToTab(tabId, {
    type: MESSAGE_TYPES.updatePageData,
    payload: {
      pageData: pageDataComponent.getData(tabId)
    }
  });
}