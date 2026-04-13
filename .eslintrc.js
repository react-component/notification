const base = require('@umijs/fabric/dist/eslint');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'react/sort-comp': 0,
    'react/require-default-props': 0,
    'jsx-a11y/no-noninteractive-tabindex': 0,
  },
  overrides: [
    ...(base.overrides || []),
    {
      // https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
      files: ['tests/*.test.tsx'],
      parserOptions: { project: './tsconfig.test.json' },
    },
  ],
};
