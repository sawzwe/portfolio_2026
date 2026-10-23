<!-- components/sawmill/SawmillScene.vue -->
<!-- The sawmill, laid out from scene-config (see docs/scene-spec.md). The main
     log and the planks are driven by scroll (CutTimeline). -->
<template>
  <SawmillMotionDriver />
  <Platform />

  <Conveyor :position="CONVEYORS.main.position" driven />
  <SwitchBox />

  <Conveyor :position="CONVEYORS.waiting.position" :length="CONVEYORS.waiting.length" />
  <Log :position="waitingLogPosition" />

  <Saw />
  <MotorBox />
  <ControlPanel />
  <Console />
  <Stool />
  <CutTimeline />
  <Sawdust />
  <Dust />
  <Workers />
</template>

<script setup lang="ts">
import SawmillMotionDriver from "./SawmillMotionDriver.vue";
import Platform from "./Platform.vue";
import Conveyor from "./Conveyor.vue";
import Log from "./Log.vue";
import SwitchBox from "./SwitchBox.vue";
import Saw from "./Saw.vue";
import MotorBox from "./MotorBox.vue";
import ControlPanel from "./ControlPanel.vue";
import Console from "./Console.vue";
import Stool from "./Stool.vue";
import CutTimeline from "./CutTimeline.vue";
import Sawdust from "./Sawdust.vue";
import Dust from "./Dust.vue";
import Workers from "./Workers.vue";
import { CONVEYOR, CONVEYORS } from "~/sawmill/scene-config";

// Waiting log ("what's next"): static, centred on its conveyor, on the belt.
const waitingLogPosition = [CONVEYORS.waiting.position[0], CONVEYOR.topY, CONVEYORS.waiting.position[2]] as const;
</script>
