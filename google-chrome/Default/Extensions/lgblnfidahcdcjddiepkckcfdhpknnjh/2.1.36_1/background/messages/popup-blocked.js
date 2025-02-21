"use strict";

async function actionInCasePopupBlocked(_, sender) {
  if (typeof sender?.tab?.id === 'number') {
    const pageData = pageDataComponent.getData(sender.tab.id);
    if (pageData) {
      await pageDataComponent.updateData(sender.tab.id, {
        blocks: (pageData.blocks || 0) + 1,
        popupBlocks: (pageData.popupBlocks || 0) + 1
      });
    }
    await statisticsComponent.incrementBlock(BLOCK_TYPES.popup);
  }
}