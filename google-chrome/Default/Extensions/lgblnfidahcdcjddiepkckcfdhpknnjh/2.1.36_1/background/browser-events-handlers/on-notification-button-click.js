"use strict";

async function onNotificationButtonClick(notificationId, buttonIndex) {
  const details = JSON.parse(notificationId);
  onNotificationButtonClickActions[buttonIndex][details.type]?.(details);
  await clearNotification(notificationId);
}
const onNotificationButtonClickActions = {
  '0': {
    [NOTIFICATION_TYPES.rate]: () => actionInCaseRate(true),
    [NOTIFICATION_TYPES.reactivate]: () => actionInCaseReactivate(NOTIFICATION_STATUSES.done),
    [NOTIFICATION_TYPES.extensionOnOff]: details => reloadTab(details.tabId),
    [NOTIFICATION_TYPES.siteOnOff]: details => reloadTab(details.tabId),
    [NOTIFICATION_TYPES.standsBrowserPromo]: () => actionInCaseStandsBrowserPromo(true)
  },
  '1': {
    [NOTIFICATION_TYPES.rate]: () => actionInCaseRate(false),
    [NOTIFICATION_TYPES.reactivate]: () => actionInCaseReactivate(NOTIFICATION_STATUSES.forLater),
    [NOTIFICATION_TYPES.standsBrowserPromo]: () => actionInCaseStandsBrowserPromo(false)
  }
};