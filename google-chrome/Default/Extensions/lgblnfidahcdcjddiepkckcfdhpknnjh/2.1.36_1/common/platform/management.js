"use strict";

async function getAllExtensions() {
  return browser.management.getAll();
}
async function uninstallSelf() {
  return browser.management.uninstallSelf({
    showConfirmDialog: true
  });
}