// sawmill/materials.ts
// The only place the sawmill scene creates materials. One matte
// MeshStandardMaterial per colour name in COLORS, built on first use and shared
// by every mesh. Components ask for a material by name and never make their own.

import {
  CanvasTexture,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from "three";
import { COLORS, MATERIAL, ROBOT, type ColorName } from "./scene-config";

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

/**
 * The robots' hover glow: a soft radial light pool on the floor and a flat
 * thruster plate under the torso. Unlit (MeshBasicMaterial) on purpose, the
 * only non-matte surfaces in the scene; shared by all robots.
 */
let glowFloor: MeshBasicMaterial | null = null;
let glowPlate: MeshBasicMaterial | null = null;
let glowTexture: CanvasTexture | null = null;
export function glowMaterials() {
  if (!glowFloor || !glowPlate) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    // alphaMap reads brightness (green channel), so draw white-to-black on
    // an opaque canvas, not white with fading alpha.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 128, 128);
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.4, "#777");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    glowTexture = new CanvasTexture(canvas);
    glowFloor = new MeshBasicMaterial({
      color: ROBOT.glow.color,
      alphaMap: glowTexture,
      transparent: true,
      opacity: ROBOT.glow.floorOpacity,
      depthWrite: false,
      fog: false,
    });
    glowPlate = new MeshBasicMaterial({ color: ROBOT.glow.color, fog: false });
  }
  return { floor: glowFloor, plate: glowPlate };
}

/** Logo textures for the robot badges, loaded once per URL. */
const logoCache = new Map<string, MeshBasicMaterial>();
export function logoMaterial(url: string) {
  let m = logoCache.get(url);
  if (!m) {
    const texture = new TextureLoader().load(url);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    m = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    logoCache.set(url, m);
  }
  return m;
}

export function disposeSceneMaterials() {
  for (const m of cache.values()) m.dispose();
  cache.clear();
  woodGrain?.dispose();
  woodGrain = null;
  hitProxy?.dispose();
  hitProxy = null;
  glowFloor?.dispose();
  glowPlate?.dispose();
  glowTexture?.dispose();
  glowFloor = glowPlate = null;
  glowTexture = null;
  for (const m of logoCache.values()) {
    m.map?.dispose();
    m.dispose();
  }
  logoCache.clear();
}
