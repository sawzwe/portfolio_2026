<!-- components/SiteNav.vue -->
<template>
  <nav
    class="fixed top-[34px] right-[44px] z-50 flex flex-col items-end gap-[6px]"
    aria-label="Primary"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="text-[13px] tracking-[0.1em] uppercase transition-colors duration-200"
      :style="{
        fontWeight: isActive(item) ? 700 : 400,
        color: isActive(item) ? '#111' : '#b3b3af',
      }"
    >
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const items = [
  { label: "home", to: "/" },
  { label: "projects", to: "/projects" },
  { label: "about", to: "/about" },
  { label: "contact", to: "/contact" },
];

function isActive(item: { to: string }) {
  if (item.to === "/") return route.path === "/";
  return route.path.startsWith(item.to);
}
</script>
