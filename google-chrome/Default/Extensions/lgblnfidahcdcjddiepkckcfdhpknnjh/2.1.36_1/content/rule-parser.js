"use strict";

class ExtendedRuleParser {
  findClosingParen(str, start) {
    let res = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '(') {
        res++;
      }
      if (str[i] === ')') {
        res--;
      }
      if (res === 0) {
        return i;
      }
    }
    return -1;
  }
  parse(rule) {
    let pos = 0;
    const selectors = [];
    while (pos < rule.length) {
      let index = rule.indexOf(':-abp', pos);
      if (index === -1) {
        selectors.push({
          selector: rule.slice(pos)
        });
        break;
      }
      let type = '';
      if (rule.indexOf(':-abp-has', pos) === index) {
        type = 'has';
      } else if (rule.indexOf(':-abp-contains', pos) === index) {
        type = 'contains';
      } else {
        throw new Error('Unknown rule type');
      }
      const start = index + ':-abp-'.length + type.length;
      const end = this.findClosingParen(rule, start);
      switch (type) {
        case 'has':
          selectors.push({
            selector: rule.slice(pos, index),
            has: this.parse(rule.slice(start + 1, end))
          });
          break;
        case 'contains':
          selectors.push({
            selector: rule.slice(pos, index),
            text: rule.slice(start + 1, end)
          });
          break;
        default:
          break;
      }
      pos = end + 1;
    }
    return selectors;
  }
}
const extendedRuleParser = new ExtendedRuleParser();