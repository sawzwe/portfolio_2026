<!-- components/sawmill/PlankLabel.vue -->
<!--
  Flat text lying on a plank's top face, reading along -Z (screen bottom-left
  to top-right, like the iso labels in master.png).

  cientos 5.10 has Text3D (extruded, needs a typeface JSON) but no flat text,
  so this uses troika-three-text directly. The font is Inter 600, bundled by
  Vite from @fontsource/inter. Long text shrinks to fit PLANK.label.maxWidth.
-->
<template>
  <primitive :object="text" :position="position" />
</template>

<script setup lang="ts">
import { Matrix4, Quaternion, Vector3 } from "three";
import { Text } from "troika-three-text";
import fontUrl from "@fontsource/inter/files/inter-latin-600-normal.woff?url";
import { material } from "~/sawmill/materials";
import { PLANK } from "~/sawmill/scene-config";

const props = defineProps<{
  text: string;
  position: readonly [number, number, number];
}>();

const L = PLANK.label;

// Text's local +X (reading) -> world -Z, +Y (glyph up) -> world -X,
// +Z (face normal) -> world +Y: lying flat, readable from the camera.
const FLAT_ALONG_Z = new Quaternion().setFromRotationMatrix(
  new Matrix4().makeBasis(new Vector3(0, 0, -1), new Vector3(-1, 0, 0), new Vector3(0, 1, 0)),
);

const text = new Text();
text.font = fontUrl;
text.anchorX = "center";
text.anchorY = "middle";
text.letterSpacing = L.letterSpacing;
text.whiteSpace = "nowrap";
// Shared matte material from the materials module (colour COLORS.label).
text.material = material("label");
text.castShadow = false;
text.receiveShadow = true;
text.quaternion.copy(FLAT_ALONG_Z);

function fit() {
  text.text = props.text;
  text.fontSize = L.fontSize;
  text.sync(() => {
    const bounds = text.textRenderInfo?.blockBounds;
    if (!bounds) return;
    const width = bounds[2] - bounds[0];
    if (width > L.maxWidth) {
      text.fontSize = Math.max(L.minFontSize, (L.fontSize * L.maxWidth) / width);
      text.sync();
    }
  });
}

watch(() => props.text, fit, { immediate: true });
onBeforeUnmount(() => text.dispose());
</script>
