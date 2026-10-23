<!-- components/sawmill/SawmillLab.vue -->
<!--
  Dev only. Renders one worker alone, framed like a reference image, so it can
  be compared close up:

    /?sawmill-lab=pose:standing        (pose-1..5 angle: front-left, slightly above)
    /?sawmill-lab=turnaround:front     (front | side | back | threeQuarter)

  Loaded by SawmillCanvas behind import.meta.dev, so it never ships.
-->
<template>
  <SawmillCamera :azimuth="view.azimuth" :elevation="view.elevation" :fit-points="fitPoints" :fit-margin="MARGIN" :scale="1" />
  <Worker :color="outfit" :pose="pose">
    <CarriedPlanks v-if="pose === 'carrying'" />
  </Worker>
  <!-- Props from the pose references. -->
  <TresGroup v-if="pose === 'seated'" :position="[0, 0, 0]">
    <Stool at-origin />
  </TresGroup>
  <RBox
    v-if="pose === 'controlPanel'"
    :size="[80, 95, 30]"
    color="machine"
    :position="[0, 47.5, 62]"
  />
</template>

<script setup lang="ts">
import SawmillCamera from "./SawmillCamera.vue";
import Worker from "./Worker.vue";
import CarriedPlanks from "./CarriedPlanks.vue";
import Stool from "./Stool.vue";
import RBox from "./RBox.vue";
import { POSES, type Outfit, type PoseName } from "~/sawmill/scene-config";

const props = defineProps<{ spec: string }>();

const deg = (d: number) => (d * Math.PI) / 180;
const MARGIN = { top: 0.06, bottom: 0.06, left: 0.06, right: 0.06 };

// Camera angles that match each reference image. The pose references are
// each shot from a different angle, all from the worker's front-left.
const POSE_VIEWS: Record<PoseName, { azimuth: number; elevation: number }> = {
  standing: { azimuth: deg(32), elevation: deg(12) },
  pushing: { azimuth: deg(72), elevation: deg(10) },
  controlPanel: { azimuth: deg(55), elevation: deg(12) },
  carrying: { azimuth: deg(50), elevation: deg(12) },
  seated: { azimuth: deg(55), elevation: deg(12) },
};
const VIEWS = {
  front: { azimuth: 0, elevation: 0 },
  side: { azimuth: deg(90), elevation: 0 },
  back: { azimuth: deg(180), elevation: 0 },
  threeQuarter: { azimuth: deg(28), elevation: deg(4) },
} as const;

// Outfit per reference: pose-2 is blue, pose-3 and pose-5 cream, the rest green.
const OUTFITS: Record<PoseName, Outfit> = {
  standing: "green",
  pushing: "blue",
  controlPanel: "cream",
  carrying: "green",
  seated: "cream",
};

const [kind, arg] = props.spec.split(":") as [string, string | undefined];
const pose = computed<PoseName>(() =>
  kind === "pose" && arg && arg in POSES ? (arg as PoseName) : "standing",
);
const view = computed(() =>
  kind === "turnaround"
    ? VIEWS[(arg ?? "front") as keyof typeof VIEWS] ?? VIEWS.front
    : POSE_VIEWS[pose.value],
);
const outfit = computed(() => OUTFITS[pose.value]);

// Bounds of the worker plus whatever it holds. Turnaround views are framed
// tight, like the reference sheets.
const fitPoints = computed(() => {
  let wide: number, back: number, front: number;
  if (kind === "turnaround") {
    const side = arg === "side";
    wide = side ? 10 : 50;
    back = side ? -26 : -14;
    front = side ? 22 : 14;
  } else {
    wide = pose.value === "carrying" ? 105 : 45;
    back = -40;
    front = pose.value === "carrying" ? 100 : pose.value === "controlPanel" ? 80 : 60;
  }
  const points: [number, number, number][] = [];
  for (const x of [-wide, wide]) for (const y of [0, 162]) for (const z of [back, front]) points.push([x, y, z]);
  return points;
});
</script>
