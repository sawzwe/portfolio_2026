<!-- components/sawmill/SawmillEffects.vue -->
<!--
  Post-processing (POST in scene-config): ambient occlusion for depth where
  objects meet (desktop only, it costs GPU time) and a gentle tilt-shift so
  the scene reads as a miniature. Must be inside <TresCanvas>.
-->
<template>
  <EffectComposerPmndrs :multisampling="POST.multisampling">
    <N8AOPmndrs
      v-if="ao"
      :ao-radius="A.aoRadius"
      :distance-falloff="A.distanceFalloff"
      :intensity="A.intensity"
      :ao-samples="A.aoSamples"
      :denoise-samples="A.denoiseSamples"
      :denoise-radius="A.denoiseRadius"
      :half-res="A.halfRes"
      :gamma-correction="false"
    />
    <TiltShiftPmndrs
      :focus-area="T.focusArea"
      :feather="T.feather"
      :offset="T.offset"
      :rotation="T.rotation"
    />
  </EffectComposerPmndrs>
</template>

<script setup lang="ts">
import { EffectComposerPmndrs, N8AOPmndrs, TiltShiftPmndrs } from "@tresjs/post-processing";
import { POST } from "~/sawmill/scene-config";

const A = POST.ao;
const T = POST.tiltShift;
// Decided once at mount: AO on wide screens with a fine pointer (desktop).
// N8AO's own gamma correction is off: it is not the last pass (tilt-shift
// follows), and correcting twice washes the colours out.
const ao = window.matchMedia(A.enabledQuery).matches;
</script>
