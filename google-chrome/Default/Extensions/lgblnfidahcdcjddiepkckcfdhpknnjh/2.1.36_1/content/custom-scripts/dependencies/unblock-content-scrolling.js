"use strict";

function unblockContentScrolling(selector) {
  if (document.readyState === 'complete' && window.top === window) {
    const documentHtml = document.children[0];
    let counter = 0;
    let interval = setInterval(() => {
      counter++;
      if (document.body.style.getPropertyValue('overflow') === 'hidden') {
        document.body.style.setProperty('overflow', 'auto', 'important');
      }
      if (documentHtml.style.getPropertyValue('overflow') === 'hidden') {
        documentHtml.style.setProperty('overflow', 'auto', 'important');
      }
      const container = document.querySelector(selector);
      if (container) {
        container.remove();
      }
      if (counter === 10 || document.body.style.cssText.includes('overflow: auto') && documentHtml.style.cssText.includes('overflow: auto') && container === null) {
        clearInterval(interval);
      }
    }, 500);
  } else {
    setTimeout(() => {
      unblockContentScrolling(selector);
    }, 500);
  }
}