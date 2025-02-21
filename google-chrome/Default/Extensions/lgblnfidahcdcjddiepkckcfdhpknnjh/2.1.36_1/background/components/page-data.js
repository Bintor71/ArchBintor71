"use strict";

class PageDataComponent extends InitializableComponent {
  container = new VariableContainer('pageDataDict', {});
  constructor() {
    super();
    this.init();
  }
  getData(tabId) {
    return this.container.getData()[tabId];
  }
  async setData(tabId, pageData) {
    const data = this.container.getData();
    data[tabId] = pageData;
    await this.container.setData(data);
  }
  async updateData(tabId, pageData) {
    const data = this.container.getData();
    const oldPageData = data[tabId];
    if (oldPageData) {
      data[tabId] = {
        ...oldPageData,
        ...pageData
      };
    }
    await this.container.setData(data);
  }
  async deleteData(tabId) {
    const data = this.container.getData();
    delete data[tabId];
    await this.container.setData(data);
  }
  async initInternal() {
    await this.container.init();
  }
  getAllData() {
    return this.container.getData();
  }
  create(url) {
    const isValidSite = url.startsWith('http');
    const host = getUrlHost(url);
    const settings = userDataComponent.getSettings();
    const blockPopups = isValidSite && settings.enabled && settings.blockPopups && !popupAllowedSitesComponent.isHostPopupAllowed(host);
    return {
      pageUrl: url,
      hostAddress: host,
      enabled: isValidSite && settings.enabled && !deactivatedSites.isHostDeactivated(host),
      blockPopups,
      showBlockedPopupNotification: blockPopups ? popupShowNotificationList.getValueByHost(host) ?? true : true,
      isValidSite,
      blocks: 0,
      popupBlocks: 0,
      timeSavingBlocks: 0,
      loadTime: new Date().getTime(),
      blockTracking: settings.blockTracking && settings.blockTracking,
      customCss: isValidSite ? customCssRules.getCssRules(host) : undefined,
      previousUrl: ''
    };
  }
  async refresh(tabId) {
    const data = this.getData(tabId);
    if (data) {
      await this.updateData(tabId, this.create(data.pageUrl));
    }
  }
  async createForAllTabs() {
    const tabs = await queryTabs({
      windowType: 'normal'
    });
    for (const tab of tabs) {
      if (typeof tab.id === 'number' && typeof tab.url === 'string' && !this.getData(tab.id)) {
        await this.setData(tab.id, this.create(tab.url));
      }
    }
  }
  getFramePageData({
    tabId,
    frameId,
    frameUrl,
    isMainFrame
  }) {
    const mainFramePageData = this.getData(tabId) || null;
    let result = null;
    if (!frameId || isMainFrame) {
      result = mainFramePageData;
    }
    if (!result) {
      result = this.create(frameUrl);
    }
    if (frameId && mainFramePageData?.isValidSite && result) {
      result.enabled = mainFramePageData.enabled;
    }
    return result;
  }
}
const pageDataComponent = new PageDataComponent();