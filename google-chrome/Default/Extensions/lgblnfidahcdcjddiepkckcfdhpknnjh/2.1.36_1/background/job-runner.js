"use strict";

class Job {
  name;
  func;
  intervalSeconds;
  constructor(name, func, intervalSeconds) {
    this.name = name;
    this.func = func;
    this.intervalSeconds = intervalSeconds;
    this.init();
  }
  async init() {
    const alarm = await browser.alarms.get(this.name);
    if (!alarm || alarm.periodInMinutes !== this.intervalSeconds / 60) {
      browser.alarms.create(this.name, {
        periodInMinutes: this.intervalSeconds / 60
      });
    }
  }
  async processAlarm() {
    try {
      await this.func();
    } catch (e) {
      debug.error('Error in processAlarm', this.name, e);
    }
  }
}
class JobRunner {
  allJobs = {};
  addJob(name, func, intervalSeconds) {
    this.allJobs[name] = new Job(name, func, intervalSeconds);
  }
}
const jobRunner = new JobRunner();
function jobsListener(alarm) {
  jobRunner.allJobs[alarm.name]?.processAlarm();
}
function createAllJobs() {
  jobRunner.addJob('reset-icon-badge', iconComponent.resetIconBadge.bind(iconComponent), 60 * 10);
  jobRunner.addJob('heartbeat', heartbeat, 60 * 60);
  jobRunner.addJob('cleanup-tabs', tabComponent.cleanupTabs.bind(tabComponent), 60 * 30);
  jobRunner.addJob('periodic-logger-save', () => serverLogger.prepareAndSend(true), 60 * 60);
  jobRunner.addJob('periodic-reporter-save', () => malwareAnalysisReporter.reportBulk(true), 30 * 60);
  jobRunner.addJob('send-notifications-data', notificationsComponent.sendDataToServer.bind(notificationsComponent), 60 * 60 * 24 * 7);
  jobRunner.addJob('save-my-stats', statisticsComponent.saveStatsInterval.bind(statisticsComponent), 60);
  jobRunner.addJob('get-matched-rules', ruleMatchedCounter.countMatchedRules.bind(ruleMatchedCounter), 60);
}