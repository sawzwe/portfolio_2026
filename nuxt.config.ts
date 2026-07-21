// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  // Build SSR output for Vercel serverless functions.
  nitro: {
    preset: "vercel",
  },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase"],
  css: ["~/assets/css/main.css"],
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
  supabase: {
    // Only the admin area requires auth. The public portfolio stays open.
    redirectOptions: {
      login: "/admin/login",
      callback: "/admin/confirm",
      include: ["/admin(/*)?"],
      exclude: ["/admin/login"],
      cookieRedirect: false,
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
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
