"use strict";

let popupScriptEmbedded = false;
function sendEventToPopupBlocking(detail) {
  document.dispatchEvent(new CustomEvent('sendToPopupBlocking', {
    detail: JSON.stringify(detail)
  }));
}
function stopBlockingPopups() {
  sendEventToPopupBlocking({
    type: MESSAGE_TYPES.stndzPopupUpdate,
    payload: {
      iframeGuid,
      active: false
    }
  });
}
function blockPopups(showNotification) {
  if (popupScriptEmbedded) {
    sendEventToPopupBlocking({
      type: MESSAGE_TYPES.stndzPopupUpdate,
      payload: {
        iframeGuid,
        active: true
      }
    });
    return;
  }
  popupScriptEmbedded = true;
  const script = currentDocument.createElement('script');
  script.src = getExtensionRelativeUrl('content/popup-blocking.js');
  script.onload = () => {
    sendEventToPopupBlocking({
      type: MESSAGE_TYPES.stndzPopupInfo,
      payload: {
        iframeGuid,
        showNotification,
        popupResources: {
          'icon.png': getExtensionRelativeUrl('/views/web_accessible/images/icon.png'),
          'help.png': getExtensionRelativeUrl('/views/web_accessible/images/help.png'),
          'close.png': getExtensionRelativeUrl('/views/web_accessible/images/close.png')
        }
      }
    });
  };
  addElementToHead(script);
}