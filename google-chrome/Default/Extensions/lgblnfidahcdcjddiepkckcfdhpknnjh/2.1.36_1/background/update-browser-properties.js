"use strict";

async function updateBrowserProperties() {
  if (!userDataComponent.getSettings().geo) {
    const result = await serverApi.callUrl({
      url: API_URLS.geo
    });
    if (result.isSuccess && result.data) {
      await userDataComponent.updateData({
        settings: {
          ...userDataComponent.getSettings(),
          geo: result.data.countryCode3
        }
      });
    }
  }
}