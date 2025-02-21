"use strict";

class MessageProcessor {
  actionInCase = {
    [MESSAGE_TYPES.blockElement]: actionInCaseBlockElement,
    [MESSAGE_TYPES.countBlockedElementsRequest]: actionInCaseCountBlockedElements,
    [MESSAGE_TYPES.deactivatedSitesRequest]: actionInCaseDeactivatedSitesRequest,
    [MESSAGE_TYPES.addCustomCssByHost]: actionInCaseAddCustomCssByHost,
    [MESSAGE_TYPES.getAppDataRequest]: actionInCaseGetAppData,
    [MESSAGE_TYPES.getBlockingDataRequest]: actionInCaseGetBlockingData,
    [MESSAGE_TYPES.getDataProcessingConsentRequest]: actionInCaseGetDataProcessingConsent,
    [MESSAGE_TYPES.getPageDataForContentRequest]: actionInCaseGetPageDataForContent,
    [MESSAGE_TYPES.getPageLoadTime]: actionInCaseGetPageLoadTime,
    [MESSAGE_TYPES.getUserSettingsRequest]: actionInCaseGetUserSettings,
    [MESSAGE_TYPES.openSettingsPage]: actionInCaseOpenSettingsPage,
    [MESSAGE_TYPES.popupBlocked]: actionInCasePopupBlocked,
    [MESSAGE_TYPES.popupSitesRequest]: actionInCasePopupSitesRequest,
    [MESSAGE_TYPES.popupUserAction]: actionInCasePopupUserAction,
    [MESSAGE_TYPES.sendEmail]: actionInCaseSendEmail,
    [MESSAGE_TYPES.setDataProcessingConsent]: actionInCaseSetDataProcessingConsent,
    [MESSAGE_TYPES.standsPopupOpened]: actionInCaseStandsPopupOpened,
    [MESSAGE_TYPES.undoBlockedElementsRequest]: actionInCaseUndoBlockedElements,
    [MESSAGE_TYPES.uninstallSelf]: actionInCaseUninstallSelf,
    [MESSAGE_TYPES.updateUserSettingsRequest]: actionInCaseUpdateUserSettings
  };
  async sendMessage(request, sender) {
    debug.log(`[MessageProcessor] Message received ${request.type}`, request);
    await statisticsComponent.waitForStart();
    await application.waitForInit();
    const result = await this.actionInCase[request.type]?.(request, sender);
    return result ?? true;
  }
}
const messageProcessor = new MessageProcessor();