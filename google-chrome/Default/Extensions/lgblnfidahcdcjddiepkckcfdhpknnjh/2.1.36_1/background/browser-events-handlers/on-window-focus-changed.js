"use strict";

async function onWindowFocusChanged(windowId) {
  if (windowId !== getNoneWindowId()) {
    await tabComponent.onTabActivated();
  }
}