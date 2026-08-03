// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';

export default withNuxt({
    rules: {
        'vue/no-multiple-template-root': 'off',
        'vue/no-v-html': 'off',
    },
})
    // Отключает все форматирующие правила eslint — форматированием владеет Prettier.
    .append(eslintConfigPrettier);
