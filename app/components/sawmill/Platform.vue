<!-- components/sawmill/Platform.vue -->
<!-- The rounded slab everything stands on. Its top is Y 0. -->
<template>
  <RBox
    :size="PLATFORM.size"
    :radius="PLATFORM.radius"
    color="platform"
    :position="[0, PLATFORM.topY - PLATFORM.size[1] / 2, 0]"
    :cast-shadow="false"
  />
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import { PLATFORM } from "~/sawmill/scene-config";
</script>
