"use strict";

class DataProcessingConsent extends InitializableComponent {
  container = new VariableContainer('dataProcessingConsent', {
    hasConsent: "chrome" !== 'firefox'
  });
  getContent() {
    return this.container.getData().hasConsent;
  }
  async setContent(hasConsent) {
    await this.container.setData({
      hasConsent
    });
  }
  async initInternal() {
    await this.container.init();
  }
}
const dataProcessingConsent = new DataProcessingConsent();