// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  // Build SSR output for Vercel serverless functions.
  nitro: {
    preset: "vercel",
  },
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/assets/css/main.css"],
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
