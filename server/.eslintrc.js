// module.exports = {
//   root: true,

//   env: {
//     node: true,
//     es2021: true
//   },

//   parser: '@typescript-eslint/parser',

//   parserOptions: {
//     ecmaVersion: 12,
//     sourceType: 'module',
//     tsconfigRootDir: __dirname,
//     project: ['./tsconfig.json']
//   },

//   plugins: ['@typescript-eslint'],
//   rules: {
//     '@typescript-eslint/no-unsafe-assignment': 'off',
//     '@typescript-eslint/no-non-null-assertion': 'off',
//     'no-useless-escape': 'off',
//     '@typescript-eslint/no-unsafe-member-access': 'off',
//     '@typescript-eslint/unbound-method': 'off',
//     '@typescript-eslint/await-thnable': 'off',
//     '@typescript-eslint/restrict-template-expressions': 'off',
//     '@typescript-eslint/no-misused-promises': 'off',
//     '@typescript-eslint/no-explicit-any': 'off',
//     '@typescript-eslint/no-unsafe-call': 'off',
//     '@typescript-eslint/no-unsafe-argument': 'off',
//     'no-async-promise-executor': 'off',
//     '@typescript-eslint/no-floating-promises': 'off',
//     '@typescript-eslint/require-await': 'off',
//     '@typescript-eslint/no-var-requires': 'off',
//     '@typescript-eslint/ban-types': 'off',
//     'no-prototype-builtins': 'off',
//     'space-before-function-paren': 0
//   },

//   extends: [
//     'eslint:recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:@typescript-eslint/recommended-requiring-type-checking',
//     'prettier'
//   ]
// }

module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': ['off'],
    'react-hooks/exhaustive-deps': 'off'
  }
}
