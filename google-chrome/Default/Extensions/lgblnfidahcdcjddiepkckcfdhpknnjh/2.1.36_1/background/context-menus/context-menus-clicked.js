"use strict";

async function deactivateSite(tabId) {
  const pageData = pageDataComponent.getData(tabId);
  const host = pageData?.hostAddress;
  if (host) {
    await deactivatedSites.toggle(host);
    await updateCurrentTabContextMenus();
    await notificationsComponent.showSiteOnOffNotification(tabId, deactivatedSites.isHostDeactivated(pageData.hostAddress), pageData.hostAddress);
    await applyNewSettingsOnTab(tabId);
    await reloadTab(tabId);
  }
}
async function contextMenusClicked(info) {
  await application.waitForInit();
  const activeTabId = await getActiveTabId();
  switch (info.menuItemId) {
    case CONTEXT_MENU_IDS.blockElementsPage:
    case CONTEXT_MENU_IDS.blockElements:
      {
        await sendMessageToTab(activeTabId, {
          type: MESSAGE_TYPES.blockElementInContent,
          payload: {
            forStandsContent: true
          }
        });
        break;
      }
    case CONTEXT_MENU_IDS.unblockElements:
      await unblockElementsOnPage(activeTabId, true);
      break;
    case CONTEXT_MENU_IDS.siteDisable:
      await deactivateSite(activeTabId);
      break;
    case CONTEXT_MENU_IDS.disable:
      await toggleExtension();
      break;
    case CONTEXT_MENU_IDS.unblockElementsPage:
      await unblockElementsOnPage(activeTabId, true);
      break;
    case CONTEXT_MENU_IDS.siteDisablePage:
      await deactivateSite(activeTabId);
      break;
    case CONTEXT_MENU_IDS.disablePage:
      await toggleExtension();
      break;
    case CONTEXT_MENU_IDS.uninstall:
      await uninstallSelf();
      break;
    default:
      break;
  }
}