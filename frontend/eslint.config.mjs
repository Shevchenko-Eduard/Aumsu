import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/html-self-closing': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'off'
  }
}).prepend({
  ignores: [
    'content/**',
    'scripts/**',
    'specs/**',
    'Reference/**',
    'СборДанных/**',
    '.output/**',
    '.nuxt/**',
    'node_modules/**'
  ]
})
