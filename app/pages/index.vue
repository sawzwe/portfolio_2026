<!-- pages/index.vue -->
<template>
  <div
    class="relative min-h-screen flex flex-col box-border"
    style="padding: 0 44px 64px; overflow-x: clip"
  >
    <!--
      Hero: sawmill scene. The section is one viewport tall per timeline
      entry; the canvas sticks while it scrolls past, and the scroll progress
      drives the cut timeline (SawmillCanvas). Decorative for assistive tech:
      the same content follows as a semantic list (TimelineList).
      The heading sits over the scene's empty top-left corner and stays put
      while the timeline scrolls.

      While the scene loads, a small saw-blade loader shows (server-rendered,
      so it is there from the first paint). The still image is only for
      browsers without WebGL, or when the scene has not drawn after
      SCENE_TIMEOUT_MS; if it arrives later it fades in over the image.
    -->
    <section
      class="sawmill-scroll"
      :class="{ 'is-static': !webgl }"
      data-sawmill-scroll
      :style="{ '--sawmill-steps': STEP_COUNT }"
    >
      <div class="sawmill-sticky">
        <div class="sawmill-visual" aria-hidden="true">
          <!-- Still image: only without WebGL, or if the scene is too slow. -->
          <Transition name="sawmill-fade">
            <img
              v-if="scene === 'fallback'"
              :src="fallbackUrl"
              alt=""
              width="1600"
              height="900"
              class="sawmill-fallback"
            />
          </Transition>
          <noscript>
            <img :src="fallbackUrl" alt="" width="1600" height="900" class="sawmill-fallback" />
          </noscript>
          <ClientOnly>
            <LazySawmillCanvas v-if="webgl" class="sawmill-live" @ready="scene = 'ready'" />
          </ClientOnly>
        </div>
        <Transition name="sawmill-fade">
          <SawmillLoader v-if="scene === 'loading'" />
        </Transition>
        <div class="hero-heading">
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
        </div>
      </div>
    </section>

    <TimelineList />

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
import { STEP_COUNT } from "~/sawmill/scene-config";
// Hashed by Vite, so a regenerated still never shows from a stale cache.
import fallbackUrl from "~/assets/sawmill/hero-fallback.webp";

// Assume WebGL during SSR; on the client, fall back to the still image (and a
// normal-height hero) if no WebGL context can be created.
const webgl = ref(true);
// loading: saw-blade loader; ready: the live scene; fallback: the still image.
const scene = ref<"loading" | "ready" | "fallback">("loading");
const SCENE_TIMEOUT_MS = 10_000;
let sceneTimer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  try {
    const probe = document.createElement("canvas");
    webgl.value = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    webgl.value = false;
  }
  if (!webgl.value) {
    scene.value = "fallback";
    return;
  }
  sceneTimer = setTimeout(() => {
    if (scene.value === "loading") scene.value = "fallback";
  }, SCENE_TIMEOUT_MS);
});
onBeforeUnmount(() => clearTimeout(sceneTimer));
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

<style scoped>
/* Scroll distance = one viewport per step; the sticky viewport adds one more.
   svh keeps the height stable while mobile browser bars show and hide. */
.sawmill-scroll {
  position: relative;
  height: calc((var(--sawmill-steps) + 1) * 100vh);
  height: calc((var(--sawmill-steps) + 1) * 100svh);
  /* Full bleed: cancel the page's side padding. */
  margin: 0 -44px;
}
.sawmill-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  background: #f2f2f0; /* COLORS.background, behind the image and canvas */
}
.sawmill-visual {
  position: absolute;
  inset: 0;
}
/* Over the canvas; clicks pass through to the scene except on the text. */
.hero-heading {
  position: absolute;
  top: 96px;
  left: 44px;
  right: 44px;
  z-index: 1;
  pointer-events: none;
}
.sawmill-fallback,
.sawmill-live {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.sawmill-fallback {
  object-fit: contain;
}
.sawmill-fade-enter-active,
.sawmill-fade-leave-active {
  transition: opacity 0.4s ease;
}
.sawmill-fade-enter-from,
.sawmill-fade-leave-to {
  opacity: 0;
}
/* No scroll animation (reduced motion, or no WebGL): a normal-height hero. */
.sawmill-scroll.is-static {
  height: auto;
}
.sawmill-scroll.is-static .sawmill-sticky {
  position: relative;
  height: min(80svh, 680px);
}
@media (prefers-reduced-motion: reduce) {
  .sawmill-scroll {
    height: auto;
  }
  .sawmill-sticky {
    position: relative;
    height: min(80svh, 680px);
  }
}
</style>
