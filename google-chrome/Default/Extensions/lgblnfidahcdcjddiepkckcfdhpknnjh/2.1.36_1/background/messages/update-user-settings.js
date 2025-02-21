"use strict";

async function actionInCaseUpdateUserSettings({
  payload
}) {
  const {
    settings,
    fromStandsPopup
  } = payload;
  const previousSettings = userDataComponent.getSettings();
  const enabledStateChanged = typeof settings.enabled === 'boolean' && settings.enabled !== previousSettings.enabled;
  if (settings.iconBadgePeriod === ICON_BADGE_PERIODS.Disabled || settings.iconBadgePeriod === ICON_BADGE_PERIODS.Page || enabledStateChanged) {
    await updateDisplayActionCountAsBadgeText(settings.iconBadgePeriod === ICON_BADGE_PERIODS.Page);
    await iconComponent.updateIcon();
  }
  if (enabledStateChanged) {
    await updateCurrentTabContextMenus();
    await notificationsComponent.changeNotificationStatus(NOTIFICATION_TYPES.reactivate, settings.enabled ? NOTIFICATION_STATUSES.nothing : NOTIFICATION_STATUSES.ready);
    await updateEnabledRulesets({
      [settings.enabled ? 'enableRulesetIds' : 'disableRulesetIds']: ['ruleset']
    });
  }
  await userDataComponent.updateData({
    settings: {
      ...previousSettings,
      ...settings
    }
  });
  if (fromStandsPopup) {
    await sendMessage({
      type: MESSAGE_TYPES.updateUserSettingsResponse,
      payload: {
        forStandsPopup: true
      }
    });
  }
  const tabs = await queryTabs({
    windowType: 'normal'
  });
  for (const tab of tabs) {
    if (typeof tab.id === 'number' && tab.url?.startsWith('http')) {
      await applyNewSettingsOnTab(tab.id);
    }
  }
}