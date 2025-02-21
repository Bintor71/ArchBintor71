/*global chrome*/

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message === 'fetch_rates') {
//     // Call api
//     const oReq = new XMLHttpRequest();
//     oReq.onreadystatechange = function(){
//       if (this.readyState === 4 && this.status === 200) {
//         if (this.status >= 200 && this.status <= 300) {
//           const rates = JSON.parse(this.responseText);
//           sendResponse({success: true, rates});
//         } else {
//           sendResponse({success: false})
//         }
//       }
//     };
//     //oReq.open("GET", "https://www.currency.wiki/rates/quotes.txt");
//     oReq.open("GET", "https://www.currency.wiki/api/currency/quotes/784565d2-9c14-4b25-8235-06f6c5029b15");
//     oReq.send();
//     return true;
//   } else if (message === 'get_commands') {
//     chrome.commands.getAll((keys) => {
//       if (keys.length) {
//         sendResponse(keys[0].shortcut);
//       } else {
//         sendResponse('NONE');
//       }
//     });
//     return true;
//   } else {
//     return false;
//   }
// });

/*global chrome*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "fetch_rates") {
    // mv3 update - use fetch
    (async function () {
      try {
        let r = await fetch(
            "https://www.currency.wiki/api/currency/quotes/784565d2-9c14-4b25-8235-06f6c5029b15"
        );
        if (r.status >= 200 && r.status <= 300) {
          let rates = await r.json();
          sendResponse({ success: true, rates });
        } else {
          sendResponse({ success: false });
        }
      } catch (e) {}
    })();
    return true;
    // // Call api
    // const oReq = new XMLHttpRequest();
    // oReq.onreadystatechange = function () {
    //   if (this.readyState === 4 && this.status === 200) {
    //     if (this.status >= 200 && this.status <= 300) {
    //       const rates = JSON.parse(this.responseText);
    //       sendResponse({ success: true, rates });
    //     } else {
    //       sendResponse({ success: false });
    //     }
    //   }
    // };
    // //oReq.open("GET", "https://www.currency.wiki/rates/quotes.txt");
    // oReq.open(
    //     "GET",
    //     "https://www.currency.wiki/api/currency/quotes/784565d2-9c14-4b25-8235-06f6c5029b15"
    // );
    // oReq.send();
    // return true;
  } else if (message === "get_commands") {
    chrome.commands.getAll((keys) => {
      if (keys.length) {
        sendResponse(keys[0].shortcut);
      } else {
        sendResponse("NONE");
      }
    });
    return true;
  } else {
    return false;
  }
});

