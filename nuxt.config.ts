// nuxt.config.ts
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineEventHandler, setHeader } from "h3";

export default defineNuxtConfig({
  devtools: { enabled: true },
  // Build SSR output for Vercel serverless functions.
  nitro: {
    preset: "vercel",
  },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase", "@tresjs/nuxt"],
  // Dev only: serves the sawmill reference image for the "O" overlay
  // (SawmillDevOverlay.vue). Not part of the build, so references/ never ships.
  devServerHandlers: [
    {
      route: "/__sawmill/master.png",
      handler: defineEventHandler(async (event) => {
        setHeader(event, "content-type", "image/png");
        return readFile(fileURLToPath(new URL("./references/master.png", import.meta.url)));
      }),
    },
  ],
  css: ["~/assets/css/main.css"],
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
  supabase: {
    // Row types are hand-written in app/types/database.ts, not generated, so
    // skip the module's generated-types lookup (and its startup warning).
    types: false,
    // Only the admin area requires auth. The public portfolio stays open.
    redirectOptions: {
      login: "/admin/login",
      callback: "/admin/confirm",
      include: ["/admin(/*)?"],
      // Signed-out pages inside /admin: sign in, and the password reset flow.
      exclude: ["/admin/login", "/admin/forgot", "/admin/reset"],
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
