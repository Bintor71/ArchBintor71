"use strict";

function findNodesByRule(rules, root = document.body) {
  const result = [];
  for (const rule of rules) {
    let matchedNodes = Array.from(root.querySelectorAll(rule.selector)).filter(node => {
      if (rule.has) {
        return findNodesByRule(rule.has, node).length > 0;
      }
      if (rule.text) {
        if (rule.text.includes('|')) {
          let inclusion = false;
          const textVariants = rule.text.split('|');
          for (let text of textVariants) {
            if (text.startsWith('/')) {
              inclusion = node.textContent?.includes(text.substring(1)) ?? false;
            } else if (text.endsWith('/')) {
              inclusion = node.textContent?.includes(text.substring(0, text.length - 1)) ?? false;
            } else {
              inclusion = node.textContent?.includes(text) ?? false;
            }
            if (inclusion) {
              break;
            }
          }
          return inclusion;
        }
        return node.textContent?.includes(rule.text);
      }
      return true;
    });
    result.push(...matchedNodes);
  }
  return result;
}
function applyExtendedRules(rules) {
  for (const rule of rules) {
    try {
      for (const node of findNodesByRule(rule)) {
        node.style.cssText = 'display: none !important';
      }
    } catch (e) {
      debug.error('Error in applyExtendedRules', e);
    }
  }
}