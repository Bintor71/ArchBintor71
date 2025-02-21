"use strict";

class RuleMatchedCounterComponent {
  async countMatchedRules() {
    await pageDataComponent.init();
    const {
      rulesMatchedInfo
    } = await getMatchedRules({
      minTimeStamp: Date.now() - 60 * 1000
    });
    const groupedByTab = Object.groupBy(rulesMatchedInfo, ({
      tabId
    }) => tabId);
    for (const tabId in groupedByTab) {
      const rules = groupedByTab[tabId] || [];
      await pageDataComponent.updateData(+tabId, {
        blocks: (pageDataComponent.getData(+tabId)?.blocks || 0) + rules.length
      });
      rules.forEach(() => {
        statisticsComponent.incrementBlock(BLOCK_TYPES.adServer);
      });
    }
  }
}
const ruleMatchedCounter = new RuleMatchedCounterComponent();