<!-- pages/contact.vue -->
<template>
  <div
    class="min-h-screen flex items-center justify-center box-border"
    style="padding: 120px 44px"
  >
    <div style="text-align: center; max-width: 820px">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase"
        style="margin-bottom: 28px"
      >
        Contact
      </div>
      <h1
        class="m-0 font-bold"
        style="font-size: clamp(48px, 7vw, 104px); letter-spacing: -0.03em"
      >
        Get in touch.
      </h1>
      <div style="height: 1px; background: #e4e4e0; margin: 56px auto"></div>

      <div class="flex flex-col items-center" style="gap: 26px">
        <a
          :href="`mailto:${site.socials.email}`"
          class="font-semibold"
          style="font-size: clamp(20px, 2.6vw, 30px); letter-spacing: -0.01em"
        >
          {{ site.socials.email }} <span style="font-size: 0.7em">↗</span>
        </a>
        <a
          :href="site.socials.linkedin"
          target="_blank"
          rel="noopener"
          class="font-semibold"
          style="font-size: clamp(18px, 2.2vw, 24px)"
        >
          LinkedIn <span style="font-size: 0.7em">↗</span>
        </a>
        <a
          :href="site.socials.cv"
          class="font-semibold"
          style="font-size: clamp(18px, 2.2vw, 24px)"
        >
          CV <span style="font-size: 0.7em">↗</span>
        </a>
      </div>

      <div
        class="text-[12px] tracking-[0.18em] uppercase"
        style="margin-top: 80px; color: #b3b3af"
      >
        {{ site.location }} · {{ site.availability }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import fallbackSite from "~/data/site.json";
import type { SiteData } from "~/types/site";

const { data: siteData } = await useSite();
const site = computed<SiteData>(
  () => siteData.value ?? (fallbackSite as SiteData)
);

useHead(() => ({
  title: "Contact — Saw Zwe Wai Yan",
  meta: [
    {
      name: "description",
      content: `Get in touch with ${site.value.name}. ${site.value.location} · ${site.value.availability}.`,
    },
  ],
}));
</script>
