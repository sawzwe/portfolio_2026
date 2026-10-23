<!-- components/sawmill/SawmillDevOverlay.vue -->
<!--
  Dev only: press "O" to toggle references/master.png at 40% opacity over the
  canvas, for lining the scene up with the reference. Loaded by SawmillCanvas
  behind import.meta.dev. The image comes from a dev-only server route
  (devServerHandlers in nuxt.config.ts), not an import: an imported asset is
  emitted into the build even when its importer is dropped.
-->
<template>
  <img
    v-show="visible"
    :src="masterUrl"
    alt=""
    aria-hidden="true"
    class="sawmill-dev-overlay"
    data-sawmill-overlay
  />
</template>

<script setup lang="ts">
const masterUrl = "/__sawmill/master.png";
const OPACITY = 0.4;
const visible = ref(false);

function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() !== "o" || e.metaKey || e.ctrlKey || e.altKey) return;
  const el = e.target as HTMLElement | null;
  if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
  visible.value = !visible.value;
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<style scoped>
.sawmill-dev-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: v-bind(OPACITY);
  pointer-events: none;
}
</style>
