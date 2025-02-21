"use strict";

class IconComponent {
  lastIconUpdateDate = getDateString(new Date());
  async updateIcon() {
    await application.waitForInit();
    const activeTabId = await getActiveTabId();
    const pageData = pageDataComponent.getData(activeTabId);
    if (!pageData) {
      return;
    }
    const disabled = !pageData.enabled || !userDataComponent.getSettings().enabled;
    await setIcon({
      path: {
        19: `icons/19${disabled ? '_gray' : ''}.png`,
        38: `icons/38${disabled ? '_gray' : ''}.png`
      }
    });
    await this.updateIconBadge(pageData);
  }
  async resetIconBadge() {
    const today = getDateString(new Date());
    if (today !== this.lastIconUpdateDate) {
      this.lastIconUpdateDate = today;
      await this.updateIcon();
    }
  }
  async updateIconBadge(pageData) {
    if (!userDataComponent.getSettings().enabled) {
      await setAppIconBadgeText(getLocalizedText('off'));
      await setAppIconBadgeTitle(getLocalizedText('stands_is_paused'));
      await updateDisplayActionCountAsBadgeText(false);
      return;
    }
    if (!pageData.enabled) {
      await setAppIconBadgeText('');
      await setAppIconBadgeTitle(getLocalizedText('the_site_was_whitelisted', [pageData.hostAddress]));
      await updateDisplayActionCountAsBadgeText(false);
      return;
    }
    await statisticsComponent.waitForStart();
    let badgeCounter;
    let badgeTitle = '';
    switch (userDataComponent.getSettings().iconBadgePeriod) {
      case ICON_BADGE_PERIODS.Disabled:
        badgeCounter = 0;
        break;
      case ICON_BADGE_PERIODS.Today:
        badgeCounter = statisticsComponent.getBlocksToday();
        badgeTitle = `${badgeCounter} ${getLocalizedText('blocks_today')}`;
        break;
      default:
        badgeCounter = pageData.blocks || 0;
        badgeTitle = `${badgeCounter} ${getLocalizedText('blocks_on_this_page')}`;
        break;
    }
    await setAppIconBadgeText(badgeCounter > 0 ? badgeCounter.toString() : '');
    await setAppIconBadgeTitle(badgeCounter > 0 ? badgeTitle : getLocalizedText('stands'));
    await updateDisplayActionCountAsBadgeText(true);
  }
}
const iconComponent = new IconComponent();