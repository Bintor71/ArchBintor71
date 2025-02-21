"use strict";

browser.runtime.onMessage.addListener(handleWindowMessages);
function startHandlingWindowMessages() {
  window.addEventListener('message', handleWindowMessagesInContent, false);
}
async function handleWindowMessagesInContent(event) {
  if (getUrlHost(event.origin) === 'standsapp.org' && event.data.type === MESSAGE_TYPES.openSettingsPage) {
    await sendMessage({
      type: MESSAGE_TYPES.openSettingsPage,
      payload: null
    });
  }
  if (event.data.payload?.iframeGuid === iframeGuid) {
    switch (event.data.type) {
      case MESSAGE_TYPES.popupUserAction:
        {
          const p = event.data.payload;
          await sendMessage({
            type: MESSAGE_TYPES.popupUserAction,
            payload: {
              host: pageData.hostAddress,
              option: p.option
            }
          });
          break;
        }
      case MESSAGE_TYPES.popupBlocked:
        {
          await sendMessage({
            type: MESSAGE_TYPES.popupBlocked,
            payload: null
          });
          break;
        }
      default:
        break;
    }
  }
}
async function handleWindowMessages({
  type,
  payload
}) {
  switch (type) {
    case MESSAGE_TYPES.getPageDataForContentResponse:
      {
        const p = payload;
        if (p.pageData?.enabled) {
          await setPageData(p.pageData);
        }
        break;
      }
    case MESSAGE_TYPES.updatePageData:
      {
        const p = payload;
        if (pageData) {
          await updatePageData(p.pageData);
        } else {
          if (p.pageData?.enabled) {
            await setPageData(p.pageData);
          }
          hideAllRelevantElements(currentDocument);
        }
        break;
      }
    case MESSAGE_TYPES.stndzShowPopupNotification:
      {
        window.top?.postMessage({
          type: MESSAGE_TYPES.stndzShowPopupNotification,
          payload: {
            iframeGuid
          }
        }, '*');
        break;
      }
    case MESSAGE_TYPES.blockElementInContent:
      {
        if (payload.forStandsContent) {
          await blockElements();
        }
        break;
      }
    default:
      break;
  }
}