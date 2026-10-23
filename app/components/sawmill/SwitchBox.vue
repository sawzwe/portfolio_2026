<!-- components/sawmill/SwitchBox.vue -->
<!-- Small grey box with toggles at the start of the main conveyor (master.png). -->
<template>
  <TresGroup :position="S.position">
    <RBox :size="S.size" :radius="S.radius" color="machine" :position="[0, S.size[1] / 2, 0]" />
    <RBox
      v-for="i in S.toggle.count"
      :key="i"
      :size="S.toggle.size"
      :radius="2"
      color="details"
      :position="[0, S.size[1] + S.toggle.size[1] / 2, (i - (S.toggle.count + 1) / 2) * 14]"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import { SWITCH_BOX as S } from "~/sawmill/scene-config";
</script>
