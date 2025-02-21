"use strict";

class CustomCssRulesComponent extends InitializableComponent {
  container = new VariableContainer('customCssRules', {});
  async add(host, info) {
    const data = this.container.getData();
    data[host] = data[host] ?? [];
    info.forEach(({
      selector,
      amount
    }) => {
      data[host].push(`${selector}@@@${amount}`);
    });
    await this.container.setData(data);
  }
  async removeAllRulesByHost(host) {
    const data = this.container.getData();
    delete data[host];
    await this.container.setData(data);
  }
  getHostSelectors(host) {
    return this.container.getData()[host];
  }
  getCssRules(host) {
    const selectors = this.container.getData()[host]?.map(rule => rule.split('@@@')[0]);
    return selectors ? `${selectors.join(', ')} ${BLOCK_CSS_VALUE}` : undefined;
  }
  async countRulesOnTab(tabId) {
    const frames = await getAllFrames(tabId);
    const hostsInTab = frames?.map(frame => getUrlHost(frame.url)).filter(Boolean) || [];
    let elementsCount = 0;
    hostsInTab.forEach(host => {
      const selectors = customCssRules.getHostSelectors(host);
      if (selectors?.length) {
        for (const selector of selectors) {
          elementsCount += Number(selector.split('@@@')[1]);
        }
      }
    });
    return elementsCount;
  }
  getUrlPatterns() {
    return Object.keys(this.container.getData()).flatMap(host => [`*://${host}/*`, `*://www.${host}/*`]);
  }
  async initInternal() {
    await this.container.init();
  }
}
const customCssRules = new CustomCssRulesComponent();