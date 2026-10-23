<!-- components/sawmill/SawmillLights.vue -->
<!-- Ambient light, image-based light from a studio HDRI, one soft
     shadow-casting directional light from the top left of the screen, and a
     light haze for depth (LIGHTS in scene-config). -->
<template>
  <TresAmbientLight :color="L.ambient.color" :intensity="L.ambient.intensity" />
  <TresDirectionalLight
    ref="key"
    :color="L.key.color"
    :position="L.key.position"
    :intensity="L.key.intensity"
    cast-shadow
  />
</template>

<script setup lang="ts">
import { EquirectangularReflectionMapping, Fog, PMREMGenerator, type DirectionalLight, type Texture, type WebGLRenderer } from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { COLORS, LIGHTS as L } from "~/sawmill/scene-config";

const { scene, renderer } = useTres();

// Haze in the background colour: the back of the scene fades slightly.
scene.value.fog = new Fog(COLORS.background, L.fog.near, L.fog.far);

// Image-based lighting from the studio HDRI (lighting only, no backdrop).
let envMap: Texture | null = null;
new HDRLoader().load(L.environment.url, (hdr) => {
  hdr.mapping = EquirectangularReflectionMapping;
  const pmrem = new PMREMGenerator(renderer as unknown as WebGLRenderer);
  envMap = pmrem.fromEquirectangular(hdr).texture;
  hdr.dispose();
  pmrem.dispose();
  scene.value.environment = envMap;
  scene.value.environmentIntensity = L.environment.intensity;
});

onBeforeUnmount(() => {
  scene.value.fog = null;
  scene.value.environment = null;
  envMap?.dispose();
});

const key = shallowRef<DirectionalLight>();

// Shadow settings are nested objects, so set them in code once the light exists.
watch(key, (light) => {
  if (!light) return;
  const s = L.key.shadow;
  light.shadow.mapSize.set(s.mapSize, s.mapSize);
  light.shadow.radius = s.radius;
  light.shadow.intensity = s.intensity;
  light.shadow.bias = s.bias;
  light.shadow.normalBias = s.normalBias;
  const cam = light.shadow.camera;
  cam.left = -s.extent;
  cam.right = s.extent;
  cam.top = s.extent;
  cam.bottom = -s.extent;
  cam.near = s.near;
  cam.far = s.far;
  cam.updateProjectionMatrix();
  // The map must be rebuilt for a new size.
  light.shadow.map?.dispose();
  light.shadow.map = null;
}, { immediate: true });
</script>
