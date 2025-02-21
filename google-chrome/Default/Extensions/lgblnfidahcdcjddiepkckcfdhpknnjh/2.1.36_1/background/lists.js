"use strict";

const easylistCssData = new DataUpdaterFromServer({
  dataName: 'easylistCss',
  expirationMinutes: 60 * 24 * 4 + 60,
  resourceUrl: API_URLS.easyList
});
const trackersListData = new DataUpdaterFromServer({
  dataName: 'trackersList',
  expirationMinutes: 90 * 24 * 60,
  resourceUrl: API_URLS.trackersList
});
async function loadLists() {
  await Promise.allSettled([easylistCssData.start(), trackersListData.start()]);
}