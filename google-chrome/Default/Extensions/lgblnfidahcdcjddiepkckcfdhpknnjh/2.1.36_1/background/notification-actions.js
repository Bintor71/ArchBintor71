"use strict";

async function actionInCaseReactivate(status) {
  if (status === NOTIFICATION_STATUSES.done) {
    await toggleExtension();
  }
  await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, status);
}
async function actionInCaseRate(agreed) {
  if (agreed) {
    await openTabWithUrl(browserInfo.getRateUrl());
  }
  await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.rate, agreed ? NOTIFICATION_STATUSES.done : NOTIFICATION_STATUSES.nothing);
}
async function actionInCaseStandsBrowserPromo(agreed) {
  if (agreed) {
    await openTabWithUrl('https://project10941031.tilda.ws/');
  }
  await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.standsBrowserPromo, agreed ? NOTIFICATION_STATUSES.done : NOTIFICATION_STATUSES.nothing);
}