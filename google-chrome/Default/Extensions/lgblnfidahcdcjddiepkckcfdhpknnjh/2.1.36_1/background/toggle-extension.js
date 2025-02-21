"use strict";

async function toggleExtension() {
  const settings = {
    ...userDataComponent.getSettings()
  };
  settings.enabled = !settings.enabled;
  settings.iconBadgePeriod = ICON_BADGE_PERIODS[settings.enabled ? 'Page' : 'Disabled'];
  await messageProcessor.sendMessage({
    type: MESSAGE_TYPES.updateUserSettingsRequest,
    payload: {
      settings
    }
  });
  await notificationsComponent.showExtensionOnOffNotification(settings.enabled);
}