"use strict";

const guidSeed = createGuidSeed();
function createGuidSeed() {
  let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  while (str.length > 0) {
    const index = Math.floor(Math.random() * str.length);
    const char = str.substring(index, index + 1);
    str = str.replace(char, '');
    seed += char;
  }
  return seed;
}
function createGuid(length = 36) {
  let guid = '';
  while (guid.length < length) {
    guid += guidSeed[Math.floor(Math.random() * guidSeed.length)];
  }
  return guid;
}
function getNormalizedTime(value) {
  if (!value) {
    return '0 seconds';
  }
  if (value < 100) {
    return `${Math.round(value * 10) / 10} seconds`;
  }
  if (value < 60 * 60) {
    return `over ${value / 60} minutes`;
  }
  if (value < 60 * 60 * 24) {
    return `over ${value / (60 * 60)} hours`;
  }
  return `over ${value / (60 * 60 * 24)} days`;
}
function getNormalizedNumber(value) {
  if (!value) {
    return '0';
  }
  if (value < 1000) {
    return value.toString();
  }
  if (value < 1000000) {
    return `over ${Math.floor(value / 1000)}K`;
  }
  return `over ${Math.floor(value / 1000000)}M`;
}
function getUrlHost(url) {
  try {
    if (url === 'about:blank') {
      return 'about:blank';
    }
    const urlDetails = new URL(url);
    return urlDetails.hostname.startsWith('www.') ? urlDetails.hostname.substring(4) : urlDetails.hostname;
  } catch (e) {
    return '';
  }
}
function debounce(func, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), ms);
  };
}
async function getActiveTab() {
  const activeTabs = await queryTabs({
    active: true,
    currentWindow: true,
    lastFocusedWindow: true
  });
  if (activeTabs.at(0)) {
    return activeTabs.at(0);
  }
  const allTabs = await queryTabs();
  return allTabs.at(0);
}
async function getActiveTabId() {
  const tab = await getActiveTab();
  return tab?.id || 0;
}