"use strict";

async function actionInCaseAddCustomCssByHost({
  payload
}) {
  await customCssRules.add(payload.host, payload.selectorsInfo);
  const activeTabId = await getActiveTabId();
  await pageDataComponent.refresh(activeTabId);
  await updateCurrentTabContextMenus();
}