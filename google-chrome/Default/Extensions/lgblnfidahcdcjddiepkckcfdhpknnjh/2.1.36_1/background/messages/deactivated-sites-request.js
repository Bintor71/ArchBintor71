"use strict";

async function actionInCaseDeactivatedSitesRequest({
  payload
}) {
  await deactivatedSites.toggle(payload.host);
  const ids = await getTabIdsByHost(payload.host);
  for (const id of ids) {
    await applyNewSettingsOnTab(id);
  }
  await reloadTabsByHost(payload.host);
  await sendMessage({
    type: MESSAGE_TYPES.deactivatedSitesResponse,
    payload: {
      forStandsPopup: true
    }
  });
}