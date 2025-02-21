"use strict";

async function getSearchStringFromStoreUrl() {
  const tabs = await queryTabs();
  for (const openTab of tabs) {
    if (openTab.id !== undefined && openTab.url && ['detail/stands-adblocker', 'detail/adblocker-stands', 'addon/stands-fair-adblocker', 'addons/detail/fair-adblocker'].some(value => openTab.url?.includes(value))) {
      return new URL(openTab.url).search;
    }
  }
  return '';
}
async function openOnboardingPageOnInstall() {
  const search = await getSearchStringFromStoreUrl();
  await openTabWithUrl(`https://www.standsapp.org/thank-you-${"chrome"}${search}`);
}
async function reportOpenTabs() {
  await malwareAnalysisReporter.init();
  const tabs = await queryTabs({
    windowType: 'normal'
  });
  for (const tab of tabs) {
    if (typeof tab.id === 'number') {
      const pageData = pageDataComponent.getData(tab.id);
      if (pageData) {
        await malwareAnalysisReporter.addReport(pageData);
      }
    }
  }
}
async function onInstalled(details) {
  await createContextMenus();
  await application.waitForInit();
  await pageDataComponent.createForAllTabs();
  if (details.reason === 'install') {
    await Promise.all([serverLogger.logInstall(), openOnboardingPageOnInstall(), reportOpenTabs()]);
  } else {
    await serverLogger.logUpdate(details);
  }
  if (!dataProcessingConsent.getContent()) {
    await openTabWithUrl('/index.html');
  }
}