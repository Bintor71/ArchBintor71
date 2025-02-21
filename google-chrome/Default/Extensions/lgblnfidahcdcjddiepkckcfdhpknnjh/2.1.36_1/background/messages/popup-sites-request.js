"use strict";

async function actionInCasePopupSitesRequest({
  payload
}) {
  await popupShowNotificationList.removeValueByHost(payload.host);
  await popupAllowedSitesComponent.toggle(payload.host);
  const ids = await getTabIdsByHost(payload.host);
  for (const id of ids) {
    await applyNewSettingsOnTab(id);
  }
  await reloadTabsByHost(payload.host);
  await sendMessage({
    type: MESSAGE_TYPES.popupSitesResponse,
    payload: {
      forStandsPopup: true
    }
  });
}