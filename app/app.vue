<!-- app.vue -->
<template>
  <div class="min-h-screen">
    <template v-if="!isAdmin">
      <TheLoader />
      <SiteNav />
      <BackButton />
    </template>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
// The admin area has its own chrome; hide the public nav/loader there.
const isAdmin = computed(() => route.path.startsWith("/admin"));
</script>
