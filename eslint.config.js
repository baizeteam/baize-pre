import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  react: false,
  node: true,
  ignores: [
    'dist/**',
    'coverage/**',
    'scripts/**',
    'template/**',
    'tsconfig*.json',
  ],
  rules: {
    // 允许 console.log
    'no-console': 'off',
    // 允许使用 process 全局变量
    'node/prefer-global/process': 'off',
    // 允许使用 Object.prototype.hasOwnProperty
    'no-prototype-builtins': 'off',
    // 允许使用 new 的副作用
    'no-new': 'off',
    // 关闭未使用变量检查
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-vars': 'off',
    // 允许类型定义使用 type 而不是 interface
    'ts/consistent-type-definitions': 'off',
    // 允许方法签名使用简写形式
    'ts/method-signature-style': 'off',
    // 允许使用 Object 而不是 object
    'ts/no-wrapper-object-types': 'off',
    // 允许使用 const assertion
    'ts/prefer-as-const': 'off',
    // ========== 关闭所有格式化相关规则，让 Prettier 完全控制格式化 ==========
    // Prettier 配置：arrowParens: "avoid", semi: false, singleQuote: true, trailingComma: "es5"

    // style/ 规则（来自 @stylistic/eslint-plugin）- 所有格式化规则
    'style/arrow-parens': 'off', // Prettier: arrowParens: "avoid"
    'style/brace-style': 'off',
    'style/comma-dangle': 'off', // Prettier: trailingComma: "es5"
    'style/comma-spacing': 'off',
    'style/comma-style': 'off',
    'style/computed-property-spacing': 'off',
    'style/eol-last': 'off', // Prettier: endOfLine: "lf"
    'style/function-call-argument-newline': 'off',
    'style/function-call-spacing': 'off',
    'style/function-paren-newline': 'off',
    'style/implicit-arrow-linebreak': 'off',
    'style/indent': 'off', // Prettier: tabWidth: 2, useTabs: false
    'style/indent-binary-ops': 'off', // Prettier 处理缩进
    'style/jsx-quotes': 'off',
    'style/key-spacing': 'off',
    'style/keyword-spacing': 'off',
    'style/linebreak-style': 'off',
    'style/max-len': 'off', // Prettier: printWidth: 80
    'style/multiline-ternary': 'off',
    'style/no-confusing-arrow': 'off',
    'style/no-extra-parens': 'off',
    'style/no-extra-semi': 'off', // Prettier: semi: false
    'style/no-floating-decimal': 'off',
    'style/no-mixed-operators': 'off',
    'style/no-mixed-spaces-and-tabs': 'off',
    'style/no-multi-spaces': 'off',
    'style/no-multiple-empty-lines': 'off',
    'style/no-tabs': 'off', // Prettier: useTabs: false
    'style/no-trailing-spaces': 'off',
    'style/no-whitespace-before-property': 'off',
    'style/nonblock-statement-body-position': 'off',
    'style/object-curly-newline': 'off',
    'style/object-curly-spacing': 'off', // Prettier: bracketSpacing: true
    'style/object-property-newline': 'off',
    'style/one-var-declaration-per-line': 'off',
    'style/operator-linebreak': 'off',
    'style/padded-blocks': 'off',
    'style/padding-line-between-statements': 'off',
    'style/quotes': 'off', // Prettier: singleQuote: true
    'style/quote-props': 'off',
    'style/rest-spread-spacing': 'off',
    'style/semi': 'off', // Prettier: semi: false
    'style/semi-spacing': 'off',
    'style/semi-style': 'off',
    'style/space-before-blocks': 'off',
    'style/space-before-function-paren': 'off',
    'style/space-in-parens': 'off',
    'style/space-infix-ops': 'off',
    'style/space-unary-ops': 'off',
    'style/spaced-comment': 'off',
    'style/switch-colon-spacing': 'off',
    'style/template-curly-spacing': 'off',
    'style/template-tag-spacing': 'off',
    'style/wrap-iife': 'off',
    'style/wrap-regex': 'off',
    'style/yield-star-spacing': 'off',

    // 标准 ESLint 格式化规则
    'comma-dangle': 'off',
    'comma-spacing': 'off',
    'comma-style': 'off',
    'computed-property-spacing': 'off',
    'eol-last': 'off',
    'func-call-spacing': 'off',
    indent: 'off',
    'key-spacing': 'off',
    'keyword-spacing': 'off',
    'linebreak-style': 'off',
    'max-len': 'off',
    'multiline-ternary': 'off',
    'no-confusing-arrow': 'off',
    'no-extra-parens': 'off',
    'no-extra-semi': 'off',
    'no-floating-decimal': 'off',
    'no-mixed-operators': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-multi-spaces': 'off',
    'no-multiple-empty-lines': 'off',
    'no-tabs': 'off',
    'no-trailing-spaces': 'off',
    'no-whitespace-before-property': 'off',
    'object-curly-newline': 'off',
    'object-curly-spacing': 'off',
    'object-property-newline': 'off',
    'one-var-declaration-per-line': 'off',
    'operator-linebreak': 'off',
    'padded-blocks': 'off',
    'padding-line-between-statements': 'off',
    quotes: 'off',
    'quote-props': 'off',
    'rest-spread-spacing': 'off',
    semi: 'off',
    'semi-spacing': 'off',
    'semi-style': 'off',
    'space-before-blocks': 'off',
    'space-before-function-paren': 'off',
    'space-in-parens': 'off',
    'space-infix-ops': 'off',
    'space-unary-ops': 'off',
    'spaced-comment': 'off',
    'switch-colon-spacing': 'off',
    'template-curly-spacing': 'off',
    'template-tag-spacing': 'off',
    'wrap-iife': 'off',
    'wrap-regex': 'off',
    'yield-star-spacing': 'off',

    // TypeScript ESLint 格式化规则
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/space-infix-ops': 'off',

    // @antfu/eslint-config 特有的格式化规则
    'antfu/if-newline': 'off',
    'antfu/import-dedupe': 'off',
    'antfu/top-level-function': 'off',
    'antfu/curly': 'off',
    // 关闭 JSDoc 相关规则
    'jsdoc/require-returns-check': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-param': 'off',
    'jsdoc/require-jsdoc': 'off',
    // 关闭 unicorn 插件中可能有兼容性问题的规则
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/error-message': 'off', // 修复兼容性问题：context.sourceCode.isGlobalReference is not a function
    'unicorn/no-new-array': 'off', // 修复兼容性问题：sourceCode.getRange is not a function
    'unicorn/new-for-builtins': 'off', // 修复兼容性问题：sourceCode.getRange is not a function
    'unicorn/no-instanceof-builtins': 'off', // 修复兼容性问题：sourceCode.getRange is not a function or its return value is not iterable
    'unicorn/prefer-module': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/prefer-array-some': 'off',
    'unicorn/prefer-array-find': 'off',
  },
})
