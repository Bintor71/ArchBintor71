"use strict";

class NotificationsComponent extends InitializableComponent {
  container = new VariableContainer('notificationsData', {
    notifications: {
      [NOTIFICATION_TYPES.rate]: {
        status: NOTIFICATION_STATUSES.ready,
        showTime: {
          2: [16],
          6: [16]
        }
      },
      [NOTIFICATION_TYPES.standsBrowserPromo]: {
        status: NOTIFICATION_STATUSES.ready,
        showTime: {
          4: [17]
        }
      },
      [NOTIFICATION_TYPES.reactivate]: {
        status: NOTIFICATION_STATUSES.nothing,
        showTime: {}
      }
    },
    timeNotificationShown: 0
  });
  async initInternal() {
    await this.container.init();
    await this.checkNotifications();
  }
  async showNotification(details, options) {
    await createNotification(JSON.stringify(details), {
      type: 'basic',
      iconUrl: getExtensionRelativeUrl('/icons/128.png'),
      title: options.title,
      message: options.message,
      priority: 2,
      buttons: options.buttons
    });
  }
  async checkNotifications() {
    const data = this.container.getData();
    const reactivateNotification = data.notifications[NOTIFICATION_TYPES.reactivate];
    if (reactivateNotification.status === NOTIFICATION_STATUSES.ready && !userDataComponent.getSettings().enabled) {
      await this.showReactivateNotification();
    }
    if (reactivateNotification.status === NOTIFICATION_STATUSES.forLater) {
      await this.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.ready);
    }
    const todayDay = new Date().getDay();
    const todayHours = new Date().getHours();
    const thisDay = new Date().getTime();
    const rateNotification = data.notifications[NOTIFICATION_TYPES.rate];
    if (rateNotification.showTime[todayDay]?.includes(todayHours)) {
      if (rateNotification.status === NOTIFICATION_STATUSES.forLater && thisDay - data.timeNotificationShown > 30 * 24 * 60 * 60 * 1000) {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.rate, NOTIFICATION_STATUSES.nothing);
        await notificationsComponent.setTimeNotificationShown();
        await this.showRateNotification();
      }
      if (rateNotification.status === NOTIFICATION_STATUSES.ready) {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.rate, NOTIFICATION_STATUSES.forLater);
        await notificationsComponent.setTimeNotificationShown();
        await this.showRateNotification();
      }
    }
    const standsBrowserPromoNotification = data.notifications[NOTIFICATION_TYPES.standsBrowserPromo];
    if (standsBrowserPromoNotification.showTime[todayDay]?.includes(todayHours)) {
      if (standsBrowserPromoNotification.status === NOTIFICATION_STATUSES.ready && thisDay - data.timeNotificationShown > 20 * 24 * 60 * 60 * 1000) {
        await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.standsBrowserPromo, NOTIFICATION_STATUSES.nothing);
        await notificationsComponent.setTimeNotificationShown();
        await this.showStandsBrowserPromoNotification();
      }
    }
  }
  async showRateNotification() {
    const stats = statisticsComponent.getSummary();
    await this.showNotification({
      type: NOTIFICATION_TYPES.rate
    }, {
      title: getLocalizedText('you_blocked_ads_popups_and_saved', [getNormalizedNumber(stats.blocking.adServers), getNormalizedNumber(stats.blocking.popups), getNormalizedTime(stats.loadTimes.timeSaved)]),
      message: getLocalizedText('rate_stands_adblocker'),
      buttons: [{
        title: 'Rate',
        iconUrl: getExtensionRelativeUrl('/icons/rate-star.png')
      }, {
        title: getLocalizedText('close')
      }]
    });
  }
  async showStandsBrowserPromoNotification() {
    await this.showNotification({
      type: NOTIFICATION_TYPES.standsBrowserPromo
    }, {
      title: 'Try Stands Browser on Android!',
      message: 'Experience a new level of ad-blocking with our Android browser. Block ads and enjoy faster browsing—anytime, anywhere.',
      buttons: [{
        title: 'Try now'
      }, {
        title: getLocalizedText('close')
      }]
    });
  }
  async showReactivateNotification() {
    await this.showNotification({
      type: NOTIFICATION_TYPES.reactivate,
      rand: Math.floor(Math.random() * 10000000000000)
    }, {
      title: getLocalizedText('turn_on_blocking'),
      message: getLocalizedText('stands_turned_off_would_turn'),
      buttons: [{
        title: getLocalizedText('turn_on'),
        iconUrl: getExtensionRelativeUrl('/icons/turn-on.png')
      }, {
        title: getLocalizedText('keep_off')
      }]
    });
    await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, NOTIFICATION_STATUSES.forLater);
  }
  async showUnblockNotification(elementsCount) {
    await this.showNotification({
      type: NOTIFICATION_TYPES.unblock,
      rand: Math.floor(Math.random() * 10000000000000)
    }, {
      title: elementsCount > 0 ? getLocalizedText('you_unblocked_on_this_page', [`${elementsCount}`, elementsCount > 1 ? getLocalizedText('elements') : getLocalizedText('element')]) : getLocalizedText('no_blocked_on_this_page'),
      message: getLocalizedText('')
    });
  }
  async showExtensionOnOffNotification(bypass) {
    await this.showNotification({
      type: NOTIFICATION_TYPES.extensionOnOff,
      tabId: await getActiveTabId(),
      rand: Math.floor(Math.random() * 10000000000000)
    }, {
      title: bypass ? getLocalizedText('stands_back_on') : getLocalizedText('stands_turned_off'),
      message: getLocalizedText('refresh_take_effect'),
      buttons: [{
        title: getLocalizedText('refresh'),
        iconUrl: getExtensionRelativeUrl('/icons/refresh.png')
      }, {
        title: getLocalizedText('close'),
        iconUrl: getExtensionRelativeUrl('/icons/close.png')
      }]
    });
  }
  async showSiteOnOffNotification(tabId, bypass, host) {
    await this.showNotification({
      type: NOTIFICATION_TYPES.siteOnOff,
      tabId,
      rand: Math.floor(Math.random() * 10000000000000)
    }, {
      title: bypass ? getLocalizedText('blocking_resumed', [host]) : getLocalizedText('the_site_was_whitelisted', [host]),
      message: getLocalizedText('refresh_take_effect'),
      buttons: [{
        title: getLocalizedText('refresh'),
        iconUrl: getExtensionRelativeUrl('/icons/refresh.png')
      }, {
        title: getLocalizedText('close')
      }]
    });
  }
  async changeNotificationStatus(type, status) {
    const data = this.container.getData();
    data.notifications[type].status = status;
    await this.container.setData(data);
  }
  async setTimeNotificationShown() {
    const data = this.container.getData();
    data.timeNotificationShown = new Date().getTime();
    await this.container.setData(data);
  }
  async sendDataToServer() {
    const data = this.container.getData();
    const userId = (await userDataComponent.onUserReady())?.privateUserId;
    await serverApi.callUrl({
      data: data.notifications,
      url: API_URLS.notifications + userId,
      method: 'PUT'
    });
  }
}
const notificationsComponent = new NotificationsComponent();