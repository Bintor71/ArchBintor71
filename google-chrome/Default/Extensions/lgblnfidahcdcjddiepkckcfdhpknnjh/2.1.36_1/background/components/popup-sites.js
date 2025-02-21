"use strict";

class PopupAllowedSitesComponent extends InitializableComponent {
  container = new VariableContainer('popupAllowedSites', {});
  async initInternal() {
    await this.container.init();
  }
  async add(host) {
    const data = this.container.getData();
    data[host] = true;
    await this.container.setData(data);
  }
  async remove(host) {
    const data = this.container.getData();
    delete data[host];
    await this.container.setData(data);
  }
  async toggle(host) {
    if (this.container.getData()[host]) {
      await this.remove(host);
    } else {
      await this.add(host);
    }
  }
  getList() {
    return Object.keys(this.container.getData());
  }
  isHostPopupAllowed(host) {
    return this.container.getData()[host];
  }
}
const popupAllowedSitesComponent = new PopupAllowedSitesComponent();