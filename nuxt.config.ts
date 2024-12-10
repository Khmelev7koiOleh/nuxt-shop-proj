// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    [
      "@vee-validate/nuxt",
      {
        // disable or enable auto imports
        autoImports: true,
        // Use different names for components
      },
    ],
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    "shadcn-nuxt",
  ],

  shadcn: {
    prefix: "Ui",

    componentDir: "./components/ui",
  },
});
