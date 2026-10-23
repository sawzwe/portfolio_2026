<!-- components/sawmill/SawmillCanvas.vue -->
<!--
  The sawmill hero canvas. Fills its parent, which sets the size.
  Must be mounted inside <ClientOnly> (WebGL has no SSR equivalent).

  Scroll: if an ancestor has [data-sawmill-scroll] (the tall hero section),
  its scroll progress drives the cut timeline: one step per entry. Listeners
  are passive and the canvas allows touch panning, so page scroll is never
  captured or blocked. The view itself is locked (no orbit, no zoom).

  Planks: hover (desktop) or tap (touch) shows the entry's card.
-->
<template>
  <div
    ref="root"
    class="sawmill-root"
    :class="{ 'is-pointing': ui.hovered !== null, 'is-ready': ui.ready }"
    data-sawmill-root
    @pointermove="onPointerMove"
    @pointerleave="state.pointer.active = false"
    @click="onRootClick"
  >
    <TresCanvas
      v-bind="gl"
      class="sawmill-canvas"
      data-sawmill-canvas
      :style="{ touchAction: 'pan-y pinch-zoom' }"
    >
      <SawmillLights />
      <SawmillEffects />
      <SawmillLab v-if="SawmillLab && labSpec" :spec="labSpec" />
      <template v-else>
        <SawmillCamera />
        <SawmillScene />
      </template>
    </TresCanvas>

    <!-- Caption pinned to its plank: a circle on the plank, a line up, the
         card on top. The anchor (the circle's centre) is moved each frame by
         CutTimeline, which also sets --pin-line and --card-shift. -->
    <div ref="anchorEl" class="plank-anchor">
      <Transition name="plank-pin" mode="out-in">
        <div v-if="cardEntry" :key="cardEntry.id" class="plank-pin">
          <span class="plank-pin__dot" />
          <span class="plank-pin__line" />
          <aside ref="cardEl" class="plank-card">
            <p v-if="cardMeta" class="plank-card__meta">{{ cardMeta }}</p>
            <p class="plank-card__title">{{ cardEntry.title }}</p>
            <p class="plank-card__detail">{{ cardEntry.detail }}</p>
          </aside>
        </div>
      </Transition>
    </div>

    <DevOverlay v-if="DevOverlay" />
  </div>
</template>

<script setup lang="ts">
import {
  ACESFilmicToneMapping,
  AgXToneMapping,
  NeutralToneMapping,
  NoToneMapping,
  PCFShadowMap,
} from "three";
import SawmillCamera from "./SawmillCamera.vue";
import SawmillLights from "./SawmillLights.vue";
import SawmillEffects from "./SawmillEffects.vue";
import SawmillScene from "./SawmillScene.vue";
import { COLORS, RENDERER, STEP_COUNT } from "~/sawmill/scene-config";
import { NEXT_ENTRY, TIMELINE } from "~/sawmill/timeline";
import { disposeSceneGeometries } from "~/sawmill/geometries";
import { disposeSceneMaterials } from "~/sawmill/materials";
import {
  CAPTION_ANCHOR,
  MOTION_STATE,
  SAWMILL_UI,
  clamp01,
  createMotionState,
  type CaptionAnchor,
  type SawmillUi,
} from "~/sawmill/motion";

// Dev-only tools; dropped from production builds.
// - DevOverlay: "O" toggles master.png over the canvas.
// - SawmillLab: ?sawmill-lab=pose:<name> | turnaround:<view> renders one
//   worker framed like its reference image.
const DevOverlay = import.meta.dev
  ? defineAsyncComponent(() => import("./SawmillDevOverlay.vue"))
  : null;
const SawmillLab = import.meta.dev
  ? defineAsyncComponent(() => import("./SawmillLab.vue"))
  : null;
const labSpec = import.meta.dev
  ? (useRoute().query["sawmill-lab"] as string | undefined)
  : undefined;
// Dev only: ?sawmill-step=<P> pins the timeline at progress P (screenshots).
const pinnedStep = import.meta.dev
  ? Number.parseFloat((useRoute().query["sawmill-step"] as string | undefined) ?? "")
  : Number.NaN;

const TONE_MAPPING = {
  none: NoToneMapping,
  aces: ACESFilmicToneMapping,
  agx: AgXToneMapping,
  neutral: NeutralToneMapping,
} as const;

// `clearColor` paints the background, so the canvas matches the scene's
// paper colour instead of showing through as transparent.
const gl = {
  clearColor: COLORS.background,
  alpha: false,
  antialias: true,
  shadows: true,
  shadowMapType: PCFShadowMap,
  toneMapping: TONE_MAPPING[RENDERER.toneMapping],
  toneMappingExposure: RENDERER.exposure,
  dpr: RENDERER.dpr,
};

// Per-frame state (plain object) and plank interaction state (reactive,
// changes only on pointer events).
const state = createMotionState();
const ui = reactive<SawmillUi>({
  hovered: null,
  selected: null,
  lastHitAt: 0,
  visible: true,
  ready: false,
  current: 0,
});
provide(MOTION_STATE, state);
provide(SAWMILL_UI, ui);

// Tell the page when the first frame is on screen (it swaps out the loader).
const emit = defineEmits<{ ready: [] }>();
watch(
  () => ui.ready,
  (ready) => ready && emit("ready"),
);

/** ResizeObserver wrapper that is a no-op during SSR. */
function createSizeObserver(onSize: (rect: DOMRectReadOnly) => void) {
  const ro = typeof ResizeObserver === "undefined"
    ? null
    : new ResizeObserver((entries) => entries[0] && onSize(entries[0].contentRect));
  return {
    observe: (el: Element) => ro?.observe(el),
    unobserve: (el: Element) => ro?.unobserve(el),
    disconnect: () => ro?.disconnect(),
  };
}

// Floating caption: CutTimeline positions the anchor; we keep the card's size
// cached (ResizeObserver) so the frame loop never has to measure it.
const anchorEl = ref<HTMLElement>();
const cardEl = ref<HTMLElement>();
const caption: CaptionAnchor = { el: null, width: 0, height: 0 };
provide(CAPTION_ANCHOR, caption);
const cardSize = createSizeObserver((rect) => {
  caption.width = rect.width;
  caption.height = rect.height;
});
watch(anchorEl, (el) => (caption.el = el ?? null), { immediate: true });
watch(cardEl, (el, old) => {
  if (old) cardSize.unobserve(old);
  if (el) cardSize.observe(el);
});

// The caption shows the hovered or tapped plank; otherwise the entry being cut
// at the current scroll step, then "what's next" once everything is stacked.
// With reduced motion (everything already stacked) only hover/tap shows it.
const cardEntry = computed(() => {
  const i = ui.selected ?? ui.hovered;
  if (i !== null) return TIMELINE[i] ?? null;
  if (reducedMotion.value) return null;
  return TIMELINE[ui.current] ?? NEXT_ENTRY;
});
const cardMeta = computed(() =>
  cardEntry.value ? [cardEntry.value.year, cardEntry.value.org].filter(Boolean).join(" · ") : "",
);

const root = ref<HTMLElement>();

function onPointerMove(e: PointerEvent) {
  const rect = root.value!.getBoundingClientRect();
  state.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  state.pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  state.pointer.active = e.pointerType === "mouse";
}

// A click that did not land on a plank clears the selection. Plank clicks run
// first (dispatched from the canvas) and stamp ui.lastHitAt.
function onRootClick() {
  if (performance.now() - ui.lastHitAt > 50) ui.selected = null;
}

// Scroll progress of the tall hero section -> timeline target.
let section: HTMLElement | null = null;
function readScroll() {
  if (!Number.isNaN(pinnedStep)) {
    state.target = pinnedStep;
    state.progress = pinnedStep;
    return;
  }
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  state.target = scrollable > 0 ? clamp01(-rect.top / scrollable) * STEP_COUNT : 0;
}

// Pause rendering while the hero is scrolled out of view.
let observer: IntersectionObserver | null = null;

let reducedQuery: MediaQueryList | null = null;
// Mirrors state.reduced reactively for the caption.
const reducedMotion = ref(false);
function readReduced() {
  state.reduced = reducedMotion.value = !!reducedQuery?.matches;
}

onMounted(() => {
  section = root.value!.closest<HTMLElement>("[data-sawmill-scroll]");
  reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  readReduced();
  reducedQuery.addEventListener("change", readReduced);
  readScroll();
  // Start where the page already is (no swoosh on reload mid-page).
  state.progress = state.target;
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", readScroll, { passive: true });
  observer = new IntersectionObserver(([entry]) => {
    ui.visible = !!entry?.isIntersecting;
  });
  observer.observe(root.value!);
});

// Geometries and materials are shared module-level caches; free them with
// the canvas. They are rebuilt on demand if the canvas mounts again.
onBeforeUnmount(() => {
  observer?.disconnect();
  cardSize.disconnect();
  window.removeEventListener("scroll", readScroll);
  window.removeEventListener("resize", readScroll);
  reducedQuery?.removeEventListener("change", readReduced);
  disposeSceneGeometries();
  disposeSceneMaterials();
});
</script>

<style scoped>
/* Hidden until the first frame renders, so the fallback image underneath
   shows while the scene loads instead of an empty canvas. */
.sawmill-root {
  position: relative;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.sawmill-root.is-ready {
  opacity: 1;
}
.sawmill-root.is-pointing {
  cursor: pointer;
}
.sawmill-canvas {
  display: block;
}

/* A zero-size point moved (transform) to just above the plank each frame. */
.plank-anchor {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  z-index: 1;
  pointer-events: none;
  will-change: transform;
}
/* Pin: the circle sits on the anchor, the line rises from it, and the card
   sits on top of the line. --card-shift slides the card back inside the
   canvas near its edges (the pin stays on the plank); `translate` centres it
   so the enter animation can use `transform` freely. */
.plank-pin {
  position: absolute;
  left: 0;
  top: 0;
}
.plank-pin__dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 11px;
  height: 11px;
  translate: -50% -50%;
  border: 1.5px solid #111;
  border-radius: 50%;
  background: #fcfcfb;
  box-shadow: 0 0 0 3px rgba(252, 252, 251, 0.6);
}
.plank-pin__line {
  position: absolute;
  left: 0;
  bottom: 5px; /* starts at the circle's edge */
  width: 1px;
  height: calc(var(--pin-line, 56px) - 5px);
  translate: -50% 0;
  background: #111;
  transform-origin: bottom;
  animation: pin-line-grow 0.28s ease-out both;
}
.plank-card {
  position: absolute;
  left: 0;
  bottom: var(--pin-line, 56px);
  translate: calc(-50% + var(--card-shift, 0px)) 0;
  width: max-content;
  max-width: min(300px, calc(100vw - 48px));
  padding: 12px 14px;
  background: #fcfcfb;
  border: 1px solid #d9d9d5;
  border-radius: 6px;
  box-shadow: 0 6px 24px rgba(17, 17, 17, 0.08);
  pointer-events: none;
  animation: pin-card-in 0.28s ease-out 0.1s both;
}
@keyframes pin-line-grow {
  from {
    transform: scaleY(0);
  }
}
@keyframes pin-card-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
.plank-card__meta {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b6b67;
}
.plank-card__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #111;
}
.plank-card__detail {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #3a3a37;
}
.plank-pin-leave-active {
  transition: opacity 0.15s ease;
}
.plank-pin-leave-to {
  opacity: 0;
}
/* Phones: a smaller card so it doesn't swamp the scene. */
@media (max-width: 480px) {
  .plank-card {
    max-width: 220px;
    padding: 9px 11px;
  }
  .plank-card__meta {
    font-size: 9px;
    margin-bottom: 4px;
  }
  .plank-card__title {
    font-size: 13px;
    margin-bottom: 4px;
  }
  .plank-card__detail {
    font-size: 11.5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .plank-pin-leave-active {
    transition: none;
  }
  .plank-pin__line,
  .plank-card {
    animation: none;
  }
}
</style>
