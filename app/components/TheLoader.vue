<!-- components/TheLoader.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none transition-opacity duration-[600ms] ease-out"
    :style="{ background: '#0c0c0c', opacity: fading ? 0 : 1 }"
    aria-hidden="true"
  >
    <Transition name="loader-msg" mode="out-in">
      <div
        :key="message"
        class="text-[14px] font-bold tracking-[0.38em] whitespace-nowrap"
        style="color: #f5f5f5"
      >
        {{ message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

// Staged messages shown while the (currently light) page prepares itself.
const messages = [
  "PREPARING…",
  "SETTING THE STAGE…",
  "ALMOST THERE…",
  "JUST A MOMENT…",
];
const STEP_MS = 620; // time each message stays on screen

const visible = ref(true);
const fading = ref(false);
const message = ref(messages[0]);

const timers: ReturnType<typeof setTimeout>[] = [];

onMounted(() => {
  // Only show the loader on the very first visit of the session.
  if (sessionStorage.getItem("seen-loader")) {
    visible.value = false;
    return;
  }
  sessionStorage.setItem("seen-loader", "1");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    visible.value = false;
    return;
  }

  // Cycle through the staged messages.
  messages.forEach((msg, i) => {
    timers.push(setTimeout(() => (message.value = msg), i * STEP_MS));
  });

  const total = messages.length * STEP_MS;
  timers.push(setTimeout(() => (fading.value = true), total));
  timers.push(setTimeout(() => (visible.value = false), total + 600));
});

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
/* Crossfade + subtle lift between messages */
.loader-msg-enter-active,
.loader-msg-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.loader-msg-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.loader-msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
