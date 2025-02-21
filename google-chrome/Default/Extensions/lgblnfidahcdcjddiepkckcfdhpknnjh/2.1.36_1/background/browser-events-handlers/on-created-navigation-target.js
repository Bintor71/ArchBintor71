"use strict";

function onCreatedNavigationTarget(details) {
  const pageData = pageDataComponent.getData(details.sourceTabId);
  if (pageData) {
    tabComponent.changeTabOpenInitiators(details.tabId, {
      url: pageData.pageUrl || '',
      tabId: details.sourceTabId
    });
  }
  if (tabComponent.isAllowNextTabCreation()) {
    tabComponent.changeOpenedFromPopupTabs(details.tabId, true);
  } else {
    tabComponent.changeNextTabCreationAllowance(null);
  }
}