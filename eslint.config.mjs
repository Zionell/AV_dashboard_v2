// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
    rules: {
        '@stylistic/semi': ['error', 'always'],
        '@stylistic/comma-dangle': ['error', 'only-multiline'],
        '@stylistic/indent': ['error', 4],
        'stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
        'vue/html-indent': ['error', 4],
        'vue/no-multiple-template-root': 'off',
        'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    },
});
