"use strict";

async function registerToEssentialEvents() {
  try {
    browser.runtime.onMessage.addListener(messageProcessor.sendMessage.bind(messageProcessor));
    browser.runtime.onInstalled.addListener(onInstalled);
  } catch (e) {
    await serverLogger.logError(e, 'registerEssentialEvents');
  }
}
async function registerToAllEvents() {
  try {
    browser.contextMenus.onClicked.addListener(contextMenusClicked);
    browser.tabs.onActivated.addListener(tabComponent.onTabActivated.bind(tabComponent));
    browser.tabs.onUpdated.addListener(tabComponent.onTabUpdated.bind(tabComponent));
    browser.tabs.onRemoved.addListener(tabComponent.onTabRemoved.bind(tabComponent));
    browser.webNavigation.onCommitted.addListener(tabComponent.setTransitions.bind(tabComponent));
    browser.windows.onFocusChanged.addListener(onWindowFocusChanged);
    browser.webNavigation.onCreatedNavigationTarget.addListener(onCreatedNavigationTarget);
    browser.notifications.onButtonClicked.addListener(onNotificationButtonClick);
    browser.notifications.onClicked.addListener(onNotificationClick);
    browser.alarms.onAlarm.addListener(jobsListener);
  } catch (e) {
    await serverLogger.logError(e, 'registerEvents');
  }
}