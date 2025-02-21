"use strict";

class DataUpdaterFromServer extends InitializableComponent {
  jobName;
  dataStorageKey;
  dataDateStorageKey;
  expirationMinutes;
  resourceUrl;
  constructor(settings) {
    super();
    this.dataStorageKey = `${settings.dataName}Value`;
    this.dataDateStorageKey = `${settings.dataName}Date`;
    this.jobName = `${settings.dataName}-load-data`;
    this.expirationMinutes = settings.expirationMinutes;
    this.resourceUrl = settings.resourceUrl;
  }
  start() {
    return this.init();
  }
  async loadDataInterval() {
    const dataDate = await storageService.get(this.dataDateStorageKey);
    let shouldLoadData = dataDate === null;
    if (dataDate !== null) {
      const lastUpdate = new Date(dataDate);
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      shouldLoadData = diff / (1000 * 60) >= this.expirationMinutes;
    }
    if (shouldLoadData) {
      await this.loadData();
    }
  }
  async loadData() {
    const userData = await userDataComponent.onUserReady();
    const {
      data,
      isSuccess,
      reason
    } = await serverApi.callUrl({
      url: `${this.resourceUrl}?key1=${userData?.privateUserId}&app_version=${getAppVersion()}`
    });
    if (isSuccess && data) {
      await storageService.set(this.dataStorageKey, data);
      await storageService.set(this.dataDateStorageKey, new Date().toISOString());
    } else if (reason) {
      await serverLogger.logError(reason, 'DataUpdaterFromServer.loadData');
    }
  }
  async initInternal() {
    jobRunner.addJob(this.jobName, () => this.loadDataInterval(), 60 * 60 * 8);
    await this.loadDataInterval();
  }
}