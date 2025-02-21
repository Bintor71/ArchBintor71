"use strict";

async function sendEmail(type, source, content) {
  await serverApi.callUrl({
    url: `https://zapier.com/hooks/catch/b2t6v9/?type=${encodeURIComponent(type)}&Source=${encodeURIComponent(source)}&Content=${encodeURIComponent(content)}`
  });
}
async function actionInCaseSendEmail({
  payload
}) {
  if (payload.type === 'FEEDBACK') {
    const {
      geo
    } = userDataComponent.getSettings();
    const content = `
      Geo: ${geo}
      Feedback: ${payload.text}
    `;
    await sendEmail('Feedback', 'App', content);
  }
  if (payload.type === 'ISSUE') {
    let url = '';
    if (payload.includeCurrentUrl) {
      const tab = await getActiveTab();
      url = tab?.url || '';
    }
    const operatingSystem = await getOperatingSystem();
    const content = `
      Geo: ${userDataComponent.getSettings().geo}
      App Version: ${getAppVersion()}
      Browser: ${browserInfo.getBrowserName()}
      Browser Version: ${browserInfo.getBrowserVersion()}
      Operating System: ${operatingSystem}
      App Enabled: ${userDataComponent.getSettings().enabled}
      Url: ${url}
      Feedback: ${payload.text}
    `;
    await sendEmail('Report Issue', 'Dashboard', content);
  }
}