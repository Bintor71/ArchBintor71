"use strict";

const LOG_EVENT_TYPES = {
  clientError: 3,
  extensionInstalled: 4,
  extensionUpdated: 5
};
class ServerLoggerComponent extends InitializableComponent {
  container = new VariableContainer('logEvents', []);
  async initInternal() {
    await this.container.init();
  }
  async sendToServer(events) {
    const userData = await userDataComponent.onUserReady();
    const anonymousUserId = await loadAnonyId();
    const hasManagementPermissions = await hasPermission('management');
    let extensions = [];
    if (hasManagementPermissions) {
      extensions = await getAllExtensions();
    }
    const data = {
      privateUserId: userData?.privateUserId,
      anonymousUserId,
      installedExtensions: extensions.map(({
        id
      }) => id),
      appVersion: getAppVersion(),
      extensionId: getExtensionId(),
      events
    };
    await serverApi.callUrl({
      url: API_URLS.log,
      method: 'POST',
      data
    });
  }
  async prepareAndSend(sendImmediately) {
    if (!dataProcessingConsent.getContent()) {
      return;
    }
    await this.container.init();
    const logs = [...this.container.getData()];
    if (logs.length >= 10 || sendImmediately && logs.length) {
      await this.container.setData([]);
      await this.sendToServer(logs);
    }
  }
  async log(event, sendImmediately = false) {
    const now = new Date();
    const logObj = {
      ...event,
      eventTime: getDateString(now, now.getHours(), now.getMinutes(), now.getSeconds())
    };
    await this.container.setData([...this.container.getData(), logObj]);
    await this.prepareAndSend(sendImmediately);
  }
  async logInstall() {
    const event = {
      eventType: LOG_EVENT_TYPES.extensionInstalled
    };
    await this.log(event, true);
  }
  async logUpdate(details) {
    const event = {
      eventType: LOG_EVENT_TYPES.extensionUpdated,
      reason: details.reason,
      previousVersion: details.previousVersion || ''
    };
    await this.log(event, true);
  }
  async logError(error, source) {
    debug.error(`Error ${error.message} from ${source}`);
    let event = {
      eventType: LOG_EVENT_TYPES.clientError,
      source,
      message: encodeURIComponent((error.message || '').replace('\n', '')),
      stack: encodeURIComponent((error.stack || '').replace('\n', ''))
    };
    await this.log(event);
  }
}
const serverLogger = new ServerLoggerComponent();