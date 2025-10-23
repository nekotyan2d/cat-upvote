// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: false,

    app: {
        head: {
            title: "😻 У кого больше апвоутов?",
        },
    },

    colorMode: {
        preference: "dark",
        fallback: "dark",
    },

    modules: ["@pinia/nuxt", "@nuxtjs/color-mode"],
});
