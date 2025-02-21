"use strict";

class TabComponent extends InitializableComponent {
  container = new VariableContainer('tabsData', {
    allowNextTabCreation: null,
    openedFromPopupTabs: {},
    tabOpenInitiators: {},
    transitions: {}
  });
  async initInternal() {
    await this.container.init();
  }
  getData() {
    return this.container.getData();
  }
  isAllowNextTabCreation() {
    const allowance = this.getData().allowNextTabCreation;
    return allowance !== null && isLastSeconds(new Date(allowance), 1);
  }
  async changeNextTabCreationAllowance(value) {
    const allowNextTabCreation = value ? value.getTime() : null;
    await this.container.setData({
      ...this.getData(),
      allowNextTabCreation
    });
  }
  async changeOpenedFromPopupTabs(tabId, value) {
    const tabData = this.getData();
    tabData.openedFromPopupTabs[tabId] = value;
    await this.container.setData(tabData);
  }
  async changeTabOpenInitiators(tabId, value) {
    const tabData = this.getData();
    tabData.tabOpenInitiators[tabId] = value;
    await this.container.setData(tabData);
  }
  async onTabUpdated(tabId, {
    url
  }) {
    if (!url) {
      return;
    }
    const existingPageData = pageDataComponent.getData(tabId);
    if (existingPageData?.pageUrl === url) {
      this.incrementTimeOnPageStats(existingPageData.loadTime);
      await pageDataComponent.refresh(tabId);
      return;
    }
    const pageData = pageDataComponent.create(url);
    const tabData = this.container.getData();
    pageData.previousUrl = existingPageData?.pageUrl || tabData.tabOpenInitiators[tabId]?.url || '';
    pageData.loadTime = new Date().getTime();
    setTimeout(async () => {
      await malwareAnalysisReporter.addReport({
        isValidSite: pageData.isValidSite,
        loadTime: pageData.loadTime,
        previousUrl: pageData.previousUrl,
        pageUrl: pageData.pageUrl,
        trt: tabData.transitions[tabId]?.[url]?.trt,
        trq: tabData.transitions[tabId]?.[url]?.trq
      });
      await this.clearTabData(tabId, url);
    }, 100);
    await pageDataComponent.setData(tabId, pageData);
    await this.onTabActivated();
  }
  async onTabActivated() {
    await application.waitForInit();
    await updateCurrentTabContextMenus();
    await iconComponent.updateIcon();
  }
  incrementTimeOnPageStats(loadTime) {
    const timeOnPage = new Date().getTime() - (loadTime || 0);
    if (timeOnPage >= 2000) {
      statisticsComponent.incrementPageView();
    }
  }
  async onTabRemoved(tabId) {
    this.incrementTimeOnPageStats(tabId);
    await this.clearTabData(tabId);
    await pageDataComponent.deleteData(tabId);
  }
  async cleanupTabs() {
    const allTabs = await queryTabs();
    const pageData = pageDataComponent.getAllData();
    for (const tabId in pageData) {
      if (!allTabs.find(tab => tab.id === Number(tabId))) {
        await this.clearTabData(Number(tabId));
        await pageDataComponent.deleteData(Number(tabId));
      }
    }
  }
  async clearTabData(tabId, transitionUrl) {
    const tabData = this.container.getData();
    delete tabData.openedFromPopupTabs[tabId];
    delete tabData.tabOpenInitiators[tabId];
    if (transitionUrl && tabData.transitions[tabId]) {
      delete tabData.transitions[tabId][transitionUrl];
    } else {
      delete tabData.transitions[tabId];
    }
    await this.container.setData(tabData);
  }
  async setTransitions(details) {
    if (details.frameId === 0) {
      const tabData = this.container.getData();
      tabData.transitions[details.tabId] = tabData.transitions[details.tabId] || {};
      tabData.transitions[details.tabId][details.url] = {
        trt: details.transitionType,
        trq: details.transitionQualifiers
      };
      await this.container.setData(tabData);
    }
  }
}
const tabComponent = new TabComponent();