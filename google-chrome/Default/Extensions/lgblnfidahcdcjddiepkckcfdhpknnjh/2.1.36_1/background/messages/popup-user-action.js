"use strict";

async function actionInCasePopupUserAction({
  payload
}, sender) {
  if (payload.option === 'block' || payload.option === 'allow') {
    if (payload.option === 'block') {
      await popupAllowedSitesComponent.remove(payload.host);
    }
    if (payload.option === 'allow') {
      await popupAllowedSitesComponent.add(payload.host);
    }
    if (typeof sender?.tab?.id === 'number') {
      await applyNewSettingsOnTab(sender.tab.id);
    }
  }
  if (payload.option === 'once' || payload.option === 'allow') {
    tabComponent.changeNextTabCreationAllowance(new Date());
  }
  await popupShowNotificationList.setValueByHost(payload.host, false);
}