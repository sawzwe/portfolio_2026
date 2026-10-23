<!-- pages/index.vue -->
<template>
  <div
    class="home-page relative min-h-screen flex flex-col box-border"
    style="overflow-x: clip"
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
      :style="{ '--sawmill-steps': timeline.length }"
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
          <!-- Without JavaScript: revealed by the <noscript> style in useHead.
               Lazy + display:none, so browsers with JS never download it. -->
          <img
            :src="fallbackUrl"
            alt=""
            width="1600"
            height="900"
            loading="lazy"
            class="sawmill-fallback sawmill-nojs"
          />
          <ClientOnly>
            <LazySawmillCanvas
              v-if="webgl && timeline.length"
              :timeline="timeline"
              class="sawmill-live"
              @ready="scene = 'ready'"
            />
          </ClientOnly>
        </div>
        <Transition name="sawmill-fade">
          <SawmillLoader v-if="scene === 'loading'" />
        </Transition>
        <!-- Desktop: the Base / Focus / Index row sits along the bottom of the
             sticky hero, so the page ends when the last plank lands. -->
        <HeroMeta :site="site" class="hero-meta-overlay" />
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

    <TimelineList :timeline="timeline" />

    <!-- Phones: the row follows the timeline list (desktop has it in the hero). -->
    <HeroMeta :site="site" class="hero-meta-below" />
  </div>
</template>

<script setup lang="ts">
import fallbackSite from "~/data/site.json";
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

// No JavaScript: show the still instead of the loader. (A <noscript> inside
// the template would break hydration; a <noscript> style in the head doesn't.)
useHead({
  noscript: [
    { innerHTML: "<style>.sawmill-nojs{display:block!important}.sawmill-loader{display:none!important}</style>" },
  ],
});
import type { SiteData, TimelineEntry } from "~/types/site";

const { data: siteData } = await useSite();
// The career timeline from the CMS (falls back to app/data/timeline.ts):
// the sawmill and the list below both render it, one step per entry.
const { data: timelineData } = await useTimeline();
const timeline = computed<TimelineEntry[]>(() => timelineData.value ?? []);
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
.home-page {
  padding: 0 44px 64px;
}
/* Desktop: nothing follows the hero (the timeline list is visually hidden
   and the row is inside the hero), so no bottom padding: the page ends
   exactly at the end of the hero's scroll. */
@media (min-width: 768px) {
  .home-page {
    padding-bottom: 0;
  }
}
.hero-meta-overlay {
  position: absolute;
  left: 44px;
  right: 44px;
  bottom: 60px; /* above the fixed copyright line (bottom: 30px) */
  z-index: 1;
}
.hero-meta-below {
  display: none;
}
@media (max-width: 767px) {
  .hero-meta-overlay {
    display: none;
  }
  .hero-meta-below {
    display: grid;
  }
}
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
.sawmill-nojs {
  display: none;
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
