"use strict";

class UserDataComponent extends InitializableComponent {
  container = new VariableContainer('userData', null);
  initializer = Promise.withResolvers();
  defaultSettings = {
    blockTracking: true,
    blockPopups: true,
    geo: '',
    enabled: true,
    guidedSetup: true,
    iconBadgePeriod: ICON_BADGE_PERIODS.Page
  };
  async updateData(data) {
    const userData = this.container.getData();
    if (userData) {
      await this.container.setData({
        ...userData,
        ...data
      });
    }
  }
  getSettings() {
    return this.container.getData()?.settings || this.defaultSettings;
  }
  async onUserReady() {
    await dataProcessingConsent.init();
    if (!dataProcessingConsent.getContent()) {
      return null;
    }
    await this.init();
    await this.initializer.promise;
    return this.container.getData();
  }
  async createUser() {
    const anonymousUserId = await loadAnonyId();
    const result = await serverApi.callUrl({
      url: API_URLS.user,
      method: 'POST',
      data: {
        anonymousUserId
      }
    });
    if (result.isSuccess && result.data?.privateUserId) {
      await this.container.setData({
        ...result.data,
        settings: result.data.settings || this.defaultSettings
      });
    }
  }
  async initInternal() {
    await this.container.init();
    if (!this.container.getData()) {
      await this.createUser();
    }
    this.initializer.resolve();
  }
}
const userDataComponent = new UserDataComponent();