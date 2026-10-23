<!-- components/SiteFooter.vue -->
<!--
  Fixed bottom-left copyright. The copyright itself is the (hidden) entry
  point to the admin panel — clicking it navigates to /admin.
-->
<template>
  <div class="fixed bottom-[30px] left-[44px] z-40">
    <NuxtLink
      to="/admin"
      aria-label="© Sawzwe"
      class="text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
      style="color: #b3b3af"
    >
      © {{ year }} Sawzwe
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<style scoped>
a:hover {
  color: #111;
}
</style>
