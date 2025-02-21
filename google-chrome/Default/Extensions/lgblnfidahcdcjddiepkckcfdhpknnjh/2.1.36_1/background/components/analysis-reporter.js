"use strict";

class MalwareAnalysisReporter extends InitializableComponent {
  container = new VariableContainer('anonyReportBulk', {
    bulk: []
  });
  async initInternal() {
    await this.container.init();
  }
  async addReport(data) {
    if (data.isValidSite) {
      const reports = this.container.getData();
      reports.bulk.push(data);
      await this.container.setData(reports);
      await this.reportBulk();
    }
  }
  async reportBulk(sendImmediately = false) {
    if (!dataProcessingConsent.getContent()) {
      return;
    }
    const data = this.container.getData();
    if (data.bulk.length >= 10 || data.bulk.length && sendImmediately) {
      const reports = [...data.bulk];
      await this.container.setData({
        bulk: []
      });
      await this.sendAnonyReportToServer(reports);
    }
  }
  async sendAnonyReportToServer(data) {
    try {
      const anonymousUserId = await loadAnonyId();
      const operatingSystem = await getOperatingSystem();
      const rows = data.map(report => ({
        nid: anonymousUserId,
        pid: '',
        sid: '',
        cc: userDataComponent.getSettings().geo,
        ts: report.loadTime,
        rfu: encodeURIComponent(report.previousUrl),
        tu: encodeURIComponent(report.pageUrl),
        trt: report.trt || '',
        trq: report.trq?.join(',') || '',
        os: operatingSystem,
        ver: getAppVersion(),
        blk: data.length
      }));
      const result = await serverApi.callUrl({
        url: API_URLS.reportUrl,
        method: 'POST',
        data: {
          rows
        }
      });
      if (!result.isSuccess && result.reason) {
        await serverLogger.logError(result.reason, 'sendAnonyReportToServer');
      }
    } catch (e) {
      await serverLogger.logError(e, 'sendAnonyReportToServer');
    }
  }
}
const malwareAnalysisReporter = new MalwareAnalysisReporter();