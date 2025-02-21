"use strict";

async function onNotificationClick(notificationId) {
  const details = JSON.parse(notificationId);
  onNotificationClickActions[details.type](details);
  await clearNotification(notificationId);
}
const onNotificationClickActions = {
  [NOTIFICATION_TYPES.rate]: () => actionInCaseRate(true),
  [NOTIFICATION_TYPES.reactivate]: () => actionInCaseReactivate(NOTIFICATION_STATUSES.done),
  [NOTIFICATION_TYPES.unblock]: () => {},
  [NOTIFICATION_TYPES.extensionOnOff]: details => reloadTab(details.tabId),
  [NOTIFICATION_TYPES.siteOnOff]: details => reloadTab(details.tabId),
  [NOTIFICATION_TYPES.standsBrowserPromo]: () => actionInCaseStandsBrowserPromo(true)
};