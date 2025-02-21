"use strict";

class PopupShowNotificationList extends InitializableComponent {
  container = new VariableContainer('popupShowNotificationList', {});
  getValueByHost(host) {
    return this.container.getData()[host];
  }
  async setValueByHost(host, value) {
    const data = this.container.getData();
    data[host] = value;
    await this.container.setData(data);
  }
  async removeValueByHost(host) {
    const data = this.container.getData();
    delete data[host];
    await this.container.setData(data);
  }
  async initInternal() {
    await this.container.init();
  }
}
const popupShowNotificationList = new PopupShowNotificationList();