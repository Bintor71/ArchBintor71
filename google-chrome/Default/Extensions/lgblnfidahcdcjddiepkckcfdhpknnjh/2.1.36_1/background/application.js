"use strict";

class Application {
  isLoaded = false;
  async waitForInit() {
    await dataProcessingConsent.init();
    if (!dataProcessingConsent.getContent()) {
      return;
    }
    if (!this.isLoaded) {
      await Promise.all([pageDataComponent.init(), deactivatedSites.init(), popupAllowedSitesComponent.init(), customCssRules.init(), popupShowNotificationList.init(), tabComponent.init(), userDataComponent.init(), notificationsComponent.init()]);
    }
    this.isLoaded = true;
  }
}
const application = new Application();