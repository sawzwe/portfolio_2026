// sawmill/materials.ts
// The only place the sawmill scene creates materials. One matte
// MeshStandardMaterial per colour name in COLORS, built on first use and shared
// by every mesh. Components ask for a material by name and never make their own.

import {
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from "three";
import { COLORS, MATERIAL, type ColorName } from "./scene-config";

const cache = new Map<ColorName, MeshStandardMaterial>();
let woodGrain: Texture | null = null;

/**
 * Grey wood-grain map shared by all wood (see MATERIAL.woodGrain). Near-white
 * on average, so the material colour stays the authored COLORS.wood and only
 * the grain darkens it. Loads asynchronously; wood renders plain until then.
 */
function woodGrainTexture() {
  if (woodGrain) return woodGrain;
  const { url, tileSize } = MATERIAL.woodGrain;
  woodGrain = new TextureLoader().load(url);
  woodGrain.colorSpace = SRGBColorSpace;
  woodGrain.wrapS = woodGrain.wrapT = RepeatWrapping;
  woodGrain.repeat.set(1 / tileSize, 1 / tileSize);
  woodGrain.anisotropy = 4;
  return woodGrain;
}

export function material(name: ColorName): MeshStandardMaterial {
  let m = cache.get(name);
  if (!m) {
    m = new MeshStandardMaterial({
      color: COLORS[name],
      roughness: MATERIAL.matte.roughness,
      metalness: MATERIAL.matte.metalness,
      map: name === "wood" ? woodGrainTexture() : null,
    });
    m.name = `sawmill:${name}`;
    cache.set(name, m);
  }
  return m;
}

/**
 * Invisible but raycastable: draws nothing (no colour, no depth) yet still
 * receives pointer events. Used for stable hover targets.
 */
let hitProxy: MeshBasicMaterial | null = null;
export function hitProxyMaterial() {
  hitProxy ??= new MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  return hitProxy;
}

export function disposeSceneMaterials() {
  for (const m of cache.values()) m.dispose();
  cache.clear();
  woodGrain?.dispose();
  woodGrain = null;
  hitProxy?.dispose();
  hitProxy = null;
}
