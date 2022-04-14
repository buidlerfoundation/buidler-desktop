module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'error',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-empty-pattern': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': 'off',
    'promise/no-nesting': 'off',
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'promise/catch-or-return': 'off',
    'react/require-default-props': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'no-restricted-globals': 'off',
    'react/no-danger': 'off',
    'no-cond-assign': 'off',
    radix: 'off',
    'no-extra-boolean-cast': 'off',
    'no-nested-ternary': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
