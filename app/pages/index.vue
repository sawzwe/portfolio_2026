<!-- pages/index.vue -->
<template>
  <div
    class="relative min-h-screen flex flex-col box-border overflow-hidden"
    style="padding: 96px 44px 40px"
  >
    <!-- Heading -->
    <div style="animation: rise 0.7s ease both">
      <div
        class="text-[12px] tracking-[0.22em] text-grey-700 uppercase mb-[14px]"
      >
        {{ site.role }}
      </div>
      <h1
        class="m-0 font-bold uppercase leading-none"
        style="
          font-size: clamp(34px, 4.6vw, 64px);
          letter-spacing: -0.02em;
        "
      >
        {{ site.name }}
      </h1>
    </div>

    <!-- Hero placeholder -->
    <div
      class="flex-1 flex items-center justify-center"
      style="min-height: 340px; padding: 32px 0; animation: rise 0.7s ease 0.14s both"
    >
      <div
        class="w-full h-full flex items-center justify-center"
        style="
          max-width: 1120px;
          min-height: 340px;
          border: 1px dashed #d2d2ce;
          border-radius: 6px;
        "
      >
        <span
          class="font-mono text-[12px] tracking-[0.08em]"
          style="color: #b3b3af"
        >
          [ hero — custom 3D model / animation ]
        </span>
      </div>
    </div>

    <!-- Meta grid -->
    <div
      class="grid gap-8 pt-6"
      style="
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        animation: rise 0.7s ease 0.24s both;
      "
    >
      <div style="border-top: 1px solid #d9d9d5; padding-top: 14px">
        <div
          class="text-[11px] tracking-[0.18em] text-grey-700 uppercase mb-2"
        >
          Base
        </div>
        <div
          class="text-[13px] font-bold tracking-[0.08em] uppercase"
        >
          {{ site.location }}
        </div>
      </div>
      <div style="border-top: 1px solid #d9d9d5; padding-top: 14px">
        <div
          class="text-[11px] tracking-[0.18em] text-grey-700 uppercase mb-2"
        >
          Focus
        </div>
        <div
          class="text-[13px] font-bold tracking-[0.08em] uppercase"
        >
          {{ site.focus }}
        </div>
      </div>
      <div style="border-top: 1px solid #d9d9d5; padding-top: 14px">
        <div
          class="text-[11px] tracking-[0.18em] text-grey-700 uppercase mb-2"
        >
          Index
        </div>
        <div
          class="text-[13px] font-bold tracking-[0.08em] uppercase"
        >
          <NuxtLink to="/projects" class="tracking-[0.08em]"
            >Portfolio 2026 →</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import fallbackSite from "~/data/site.json";
import type { SiteData } from "~/types/site";

const { data: siteData } = await useSite();
const site = computed<SiteData>(
  () => siteData.value ?? (fallbackSite as SiteData)
);

useHead(() => ({
  title: `${site.value.name} — ${site.value.role}`,
  meta: [
    {
      name: "description",
      content: `${site.value.name}, ${site.value.role} based in ${site.value.location}. ${site.value.intro}`,
    },
  ],
}));
</script>
