<!-- components/sawmill/SawmillLoader.vue -->
<!--
  Shown in the hero while the 3D scene loads: a slowly turning saw blade and a
  short label, in the page's own type style. Static with reduced motion.
  Server-rendered, so it is there from the first paint (no flash of an old
  still image).
-->
<template>
  <div class="sawmill-loader" role="status" aria-live="polite">
    <svg class="sawmill-loader__blade" viewBox="-50 -50 100 100" aria-hidden="true">
      <path :d="bladePath" />
      <circle r="11" />
    </svg>
    <p class="sawmill-loader__label">Setting up the sawmill</p>
  </div>
</template>

<script setup lang="ts">
// The 3D blade's sawtooth profile (sawmill/geometries.ts), drawn as an icon
// with fewer, deeper teeth so it still reads as a saw at 48px.
const TEETH = 16;
const R = 48;
const inner = R * 0.74;
const step = (Math.PI * 2) / TEETH;
const points: string[] = [];
for (let i = 0; i < TEETH; i++) {
  const a = i * step;
  const b = a + step * 0.8;
  points.push(`${(Math.cos(a) * inner).toFixed(2)},${(Math.sin(a) * inner).toFixed(2)}`);
  points.push(`${(Math.cos(b) * R).toFixed(2)},${(Math.sin(b) * R).toFixed(2)}`);
}
const bladePath = `M${points.join("L")}Z`;
</script>

<style scoped>
.sawmill-loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  pointer-events: none;
}
.sawmill-loader__blade {
  width: 48px;
  height: 48px;
  animation: sawmill-loader-spin 1.6s linear infinite;
}
.sawmill-loader__blade path {
  fill: #b9bdc0;
}
.sawmill-loader__blade circle {
  fill: #6f7378;
}
.sawmill-loader__label {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8a8a86;
}
@keyframes sawmill-loader-spin {
  to {
    transform: rotate(-360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .sawmill-loader__blade {
    animation: none;
  }
}
</style>
