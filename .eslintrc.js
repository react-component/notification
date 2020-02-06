const base = require('@umijs/fabric/dist/eslint');
const path = require('path');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'react/require-default-props': 0,
    'jsx-a11y/no-noninteractive-tabindex': 0,
  },
};
