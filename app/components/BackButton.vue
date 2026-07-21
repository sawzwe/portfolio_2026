<!-- components/BackButton.vue -->
<template>
  <div class="fixed top-[30px] left-[44px] z-50">
    <NuxtLink
      v-if="target"
      :to="target"
      aria-label="Back"
      class="flex items-center justify-center w-[46px] h-[46px] rounded-full text-[16px] transition-transform duration-200 hover:scale-110"
      style="background: #111; color: #fff"
    >
      ‹
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Home has no back button. Project detail returns to the list, everything
// else returns home.
const target = computed<string | null>(() => {
  if (route.path === "/") return null;
  if (route.path.startsWith("/projects/")) return "/projects";
  return "/";
});
</script>

<style scoped>
a:hover {
  color: #fff;
}
</style>
