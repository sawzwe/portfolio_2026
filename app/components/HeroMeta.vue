<!-- components/HeroMeta.vue -->
<!-- The Base / Focus / Index row under the home hero. -->
<template>
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
</template>

<script setup lang="ts">
import type { SiteData } from "~/types/site";

defineProps<{ site: SiteData }>();
</script>
