"use strict";

class StatisticsComponent extends InitializableComponent {
  statsLsKey = 'stats';
  statsBufferLsKey = 'dailyStatsBuffer';
  started = false;
  isDirty = false;
  summaryData = {
    blocksCounter: 0,
    blocksToday: 0,
    lastBlockUpdate: null,
    lastActivityUpdate: null
  };
  stats = {
    migrated: false
  };
  statsBuffer = {};
  constructor() {
    super();
    this.init();
  }
  async incrementBlock(typeId, resourceType) {
    await this.waitForStart();
    this.isDirty = true;
    const now = new Date();
    this.incrementBlockCounter(now, this.statsBuffer, typeId, resourceType);
    this.summaryData.blocksToday = isSameDay(new Date(this.summaryData.lastBlockUpdate), now) ? this.summaryData.blocksToday + 1 : 1;
    this.summaryData.blocksCounter++;
    this.summaryData.lastBlockUpdate = now.getTime();
    this.summaryData.lastActivityUpdate = now.getTime();
  }
  async incrementPageView() {
    await this.waitForStart();
    this.isDirty = true;
    const now = new Date();
    this.incrementPageViewCounter(now);
    this.summaryData.lastActivityUpdate = now.getTime();
  }
  async pageLoadCompleted(loadTime, timeSaved) {
    await this.waitForStart();
    this.isDirty = true;
    const now = new Date();
    this.incrementPageLoadTime(now, this.statsBuffer, loadTime, timeSaved);
    this.summaryData.lastActivityUpdate = now.getTime();
  }
  async onStandsPopupOpened() {
    await this.waitForStart();
    this.isDirty = true;
    const now = new Date();
    this.summaryData.lastActivityUpdate = now.getTime();
  }
  async start() {
    const nowTime = new Date().getTime();
    this.summaryData.lastActivityUpdate = nowTime;
    this.stats = (await storageService.get(this.statsLsKey)) || {
      migrated: false
    };
    this.statsBuffer = (await storageService.get(this.statsBufferLsKey)) || {};
    if (!this.stats.migrated) {
      this.applyStatsOnObject(this.statsBuffer, this.stats, false);
      this.stats.migrated = true;
      await storageService.set(this.statsLsKey, this.stats);
    }
    const summary = this.getSummary();
    this.summaryData.blocksCounter = summary.blocksCounter;
    this.summaryData.blocksToday = summary.blocksToday;
    this.summaryData.lastBlockUpdate = nowTime;
    this.started = true;
  }
  getBlocksToday() {
    const now = new Date();
    return typeof this.summaryData.lastBlockUpdate === 'number' && isSameDay(new Date(this.summaryData.lastBlockUpdate), now) ? this.summaryData.blocksToday : 0;
  }
  async waitForStart() {
    await dataProcessingConsent.init();
    if (!dataProcessingConsent.getContent()) {
      return;
    }
    if (!this.started) {
      await this.initInternal();
    }
  }
  getBlockingData() {
    let minDate = null;
    const result = {
      days: {},
      adServers: 0,
      trackers: 0,
      malware: 0,
      popups: 0,
      blocks: 0,
      other: 0
    };
    const daysData = {};
    function summarizeStats(obj) {
      for (const date in obj) {
        if (Number.isNaN(Date.parse(date)) || !obj[date].blocks) {
          continue;
        }
        const dateObj = new Date(date);
        const dateKey = getDateString(dateObj);
        if (!minDate || minDate > dateObj) {
          minDate = dateObj;
        }
        if (!daysData[dateKey]) {
          daysData[dateKey] = {
            blocks: 0,
            adServers: 0,
            trackers: 0,
            malware: 0,
            popups: 0,
            other: 0
          };
        }
        daysData[dateKey].blocks += obj[date].blocks;
        result.blocks += obj[date].blocks;
        daysData[dateKey].adServers += obj[date].adServers || 0;
        result.adServers += obj[date].adServers || 0;
        daysData[dateKey].trackers += obj[date].trackers || 0;
        result.trackers += obj[date].trackers || 0;
        daysData[dateKey].malware += obj[date].malware || 0;
        result.malware += obj[date].malware || 0;
        daysData[dateKey].popups += obj[date].popups || 0;
        result.popups += obj[date].popups || 0;
        daysData[dateKey].other += obj[date].other || 0;
        result.other += obj[date].other || 0;
      }
    }
    summarizeStats(this.stats);
    summarizeStats(this.statsBuffer);
    if (Object.keys(daysData).length > 0) {
      const today = new Date(getDateString(new Date()));
      const currentDate = minDate;
      while (currentDate <= today) {
        const dateKey = getDateString(currentDate);
        if (!daysData[dateKey]) {
          daysData[dateKey] = {
            blocks: 0,
            adServers: 0,
            trackers: 0,
            malware: 0,
            popups: 0,
            other: 0
          };
        }
        currentDate?.setDate(currentDate.getDate() + 1);
      }
    }
    result.days = daysData;
    return result;
  }
  applyStatsOnObject(source, target, add) {
    const ignore = {
      tags: true,
      pv: true,
      malwareSite: true
    };
    for (const key in source) {
      if (ignore[key]) {
        continue;
      }
      if (typeof source[key] === 'number') {
        if (add) {
          if (typeof target[key] === 'undefined') {
            target[key] = source[key];
          } else {
            target[key] += source[key];
          }
        } else if (typeof target[key] === 'number') {
          target[key] -= source[key];
        }
      } else if (typeof source[key] === 'object') {
        if (typeof target[key] === 'object') {
          this.applyStatsOnObject(source[key], target[key], add);
        } else if (add) {
          target[key] = source[key];
        }
      }
    }
  }
  async saveStatsInterval() {
    if (this.isDirty) {
      await storageService.set(this.statsBufferLsKey, this.statsBuffer);
      this.isDirty = false;
    }
  }
  getSummary(today = new Date(getDateString(new Date()))) {
    const summary = {
      blocksToday: 0,
      blocksCounter: 0,
      blocking: {
        adServers: 0,
        trackers: 0,
        malware: 0,
        popups: 0
      },
      loadTimes: {
        pageLoadTime: 0,
        timeSaved: 0
      }
    };
    function summarizeStats(obj) {
      for (const date in obj) {
        if (isNaN(Date.parse(date))) {
          continue;
        }
        const currentDate = new Date(date);
        if (obj[date].blocks >= 0) {
          summary.blocksCounter += obj[date].blocks;
          if (obj[date].adServers) {
            summary.blocking.adServers += obj[date].adServers;
          }
          if (obj[date].trackers) {
            summary.blocking.trackers += obj[date].trackers;
          }
          if (obj[date].malware) {
            summary.blocking.malware += obj[date].malware;
          }
          if (obj[date].popups) {
            summary.blocking.popups += obj[date].popups;
          }
          if (!obj[date].adServers && !obj[date].trackers && !obj[date].malware) {
            summary.blocking.adServers += obj[date].blocks;
          }
          if (currentDate >= today) {
            summary.blocksToday += obj[date].blocks;
          }
        }
        if (obj[date].loadTime) {
          summary.loadTimes.pageLoadTime += obj[date].loadTime;
          summary.loadTimes.timeSaved += obj[date].timeSaved;
        }
      }
    }
    summarizeStats(this.stats);
    summarizeStats(this.statsBuffer);
    const getTimeSaved = timeSaved => parseFloat(timeSaved ? timeSaved.toFixed(2) : '0');
    const {
      loadTimes
    } = summary;
    loadTimes.timeSaved = getTimeSaved(loadTimes.timeSaved);
    loadTimes.pageLoadTime = getTimeSaved(loadTimes.pageLoadTime);
    return summary;
  }
  incrementBlockCounter(now, obj, typeId, resourceType) {
    const hour = getDateString(now, now.getHours());
    obj[hour] = obj[hour] || {};
    obj[hour].blocks = (obj[hour].blocks || 0) + 1;
    if (typeId === BLOCK_TYPES.adServer || typeId === BLOCK_TYPES.sponsored) {
      obj[hour].adServers = (obj[hour].adServers || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.tracker) {
      obj[hour].trackers = (obj[hour].trackers || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.malware) {
      obj[hour].malware = (obj[hour].malware || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.malware && resourceType === 'main_frame') {
      obj[hour].malwareSite = (obj[hour].malwareSite || 0) + 1;
    }
    if (typeId === BLOCK_TYPES.popup) {
      obj[hour].popups = (obj[hour].popups || 0) + 1;
    }
    const isOther = !typeId || ![BLOCK_TYPES.adServer, BLOCK_TYPES.tracker, BLOCK_TYPES.malware, BLOCK_TYPES.popup, BLOCK_TYPES.sponsored].includes(typeId);
    if (isOther) {
      obj[hour].other = (obj[hour].other || 0) + 1;
    }
  }
  incrementPageViewCounter(now) {
    const hour = getDateString(now, now.getHours());
    this.statsBuffer[hour] = this.statsBuffer[hour] || {
      pv: 0
    };
    this.statsBuffer[hour].pv += 1;
  }
  incrementPageLoadTime(now, obj, loadTime, timeSaved) {
    const hour = getDateString(now, now.getHours());
    obj[hour] = obj[hour] || {};
    obj[hour].loadTime = obj[hour].loadTime ? obj[hour].loadTime + loadTime : loadTime;
    obj[hour].timeSaved = obj[hour].timeSaved ? obj[hour].timeSaved + timeSaved : timeSaved;
  }
  async initInternal() {
    await userDataComponent.onUserReady();
    await this.start();
  }
}
const statisticsComponent = new StatisticsComponent();