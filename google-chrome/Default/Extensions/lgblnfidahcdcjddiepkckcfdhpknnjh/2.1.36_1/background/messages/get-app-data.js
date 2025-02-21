"use strict";

async function actionInCaseGetAppData() {
  const activeTabId = await getActiveTabId();
  const pageData = pageDataComponent.getData(activeTabId);
  if (pageData) {
    await sendMessage({
      type: MESSAGE_TYPES.getAppDataResponse,
      payload: {
        forStandsPopup: true,
        data: {
          appVersion: getAppVersion(),
          currentPageData: pageData,
          deactivatedSites: deactivatedSites.getList(),
          popupsWhitelist: popupAllowedSitesComponent.getList(),
          stats: statisticsComponent.getSummary(),
          urls: {
            privacyUrl: RESOURCES.privacyUrl,
            rateUrl: browserInfo.getRateUrl(),
            termsUrl: RESOURCES.termsUrl
          }
        }
      }
    });
  }
}