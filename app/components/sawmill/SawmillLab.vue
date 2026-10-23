<!-- components/sawmill/SawmillLab.vue -->
<!--
  Dev only. Renders one worker alone, framed like a reference image, so it can
  be compared close up:

    /?sawmill-lab=pose:standing        (pose-1..5 angle: front-left, slightly above)
    /?sawmill-lab=turnaround:front     (front | side | back | threeQuarter)
    /?sawmill-lab=robot:pushing        (robot-pose-1..4 angle; switch | pushing | controlPanel | carrying)
    /?sawmill-lab=robotturn:front      (robot-front/side/back/three-quarter.png)

  Loaded by SawmillCanvas behind import.meta.dev, so it never ships.
-->
<template>
  <SawmillCamera :azimuth="view.azimuth" :elevation="view.elevation" :fit-points="fitPoints" :fit-margin="MARGIN" :scale="1" />
  <Robot v-if="isRobot" :accent="accent" :pose="kind === 'robotturn' ? restPose : pose">
    <CarriedPlanks v-if="pose === 'carrying'" />
  </Robot>
  <Worker v-else :color="outfit" :pose="pose">
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
import Robot from "./Robot.vue";
import CarriedPlanks from "./CarriedPlanks.vue";
import Stool from "./Stool.vue";
import RBox from "./RBox.vue";
import { POSES, type Outfit, type PoseName, type RobotAccent } from "~/sawmill/scene-config";

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
  // references/ai/robot-pose-*.png are all shot from the front-left.
  switch: { azimuth: deg(30), elevation: deg(8) },
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
  switch: "green",
};

// Accent per robot reference (robot-poses.png, left to right).
const ACCENTS: Partial<Record<PoseName, RobotAccent>> = {
  switch: "robotGreen",
  pushing: "robotBlue",
  controlPanel: "robotIndigo",
  carrying: "robotSand",
};

const [kind, arg] = props.spec.split(":") as [string, string | undefined];
const isRobot = kind === "robot" || kind === "robotturn";
const isTurnaround = kind === "turnaround" || kind === "robotturn";
const pose = computed<PoseName>(() => {
  if ((kind === "pose" || kind === "robot") && arg && arg in POSES) return arg as PoseName;
  return isRobot ? "switch" : "standing";
});
// The robot turnaround stands at rest: arms hanging out a little.
const restPose = { ...POSES.switch, shoulderR: POSES.switch.shoulderL, torsoLean: 0 };
const accent = computed<RobotAccent>(() => ACCENTS[pose.value] ?? "robotGreen");
const view = computed(() =>
  isTurnaround
    ? VIEWS[(arg ?? "front") as keyof typeof VIEWS] ?? VIEWS.front
    : POSE_VIEWS[pose.value],
);
const outfit = computed(() => OUTFITS[pose.value]);

// Bounds of the worker plus whatever it holds. Turnaround views are framed
// tight, like the reference sheets.
const fitPoints = computed(() => {
  let wide: number, back: number, front: number;
  if (isTurnaround) {
    const side = arg === "side";
    wide = side ? 10 : isRobot ? 58 : 50;
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
