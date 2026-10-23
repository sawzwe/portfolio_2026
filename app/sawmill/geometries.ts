// sawmill/geometries.ts
// Geometry cache for the sawmill scene. Every shape is built once per size and
// shared by all meshes that use it, so 100+ meshes cost a few dozen geometries.
//
// Meshes receive these through the `geometry` prop. Tres does not dispose
// prop-assigned geometry when a mesh unmounts, so sharing is safe; the whole
// cache is disposed with the canvas (disposeSceneGeometries).

import {
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Shape,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Vec3 = readonly [number, number, number];

const cache = new Map<string, BufferGeometry>();

function cached<T extends BufferGeometry>(key: string, build: () => T): T {
  let geometry = cache.get(key);
  if (!geometry) {
    geometry = build();
    cache.set(key, geometry);
  }
  return geometry as T;
}

/**
 * Box with rounded edges, centred on the origin. Two segments per rounded
 * edge read as smooth at hero scale; tiny radii get one (they are a pixel or
 * two on screen), which keeps the scene around 50k triangles.
 */
export function roundedBox(size: Vec3, radius: number, segments = radius < 1.5 ? 1 : 2) {
  const [w, h, d] = size;
  // RoundedBoxGeometry breaks if the radius exceeds half the smallest side.
  const r = Math.min(radius, Math.min(w, h, d) / 2 - 0.01);
  return cached(`rbox:${w}:${h}:${d}:${r}:${segments}`, () =>
    boxProjectUVs(new RoundedBoxGeometry(w, h, d, segments, r)),
  );
}

/**
 * Replace UVs with box projection in world units: each vertex takes the two
 * coordinates across its dominant normal axis. Textures then keep the same
 * scale on every face and box size (MATERIAL.woodGrain.tileSize), and U runs
 * along Z on the top, bottom and side faces, so grain follows a plank's length.
 */
function boxProjectUVs(geometry: BufferGeometry) {
  const pos = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (ny >= nx && ny >= nz) uv.setXY(i, z, x); // top / bottom
    else if (nx >= nz) uv.setXY(i, z, y); // sides along the length
    else uv.setXY(i, x, y); // ends
  }
  uv.needsUpdate = true;
  return geometry;
}

/** Cylinder along Y, centred on the origin. */
export function cylinder(radius: number, height: number, radialSegments = 24) {
  return cached(`cyl:${radius}:${height}:${radialSegments}`, () =>
    new CylinderGeometry(radius, radius, height, radialSegments),
  );
}

/** Saw blade: a flat sawtooth disc in the XY plane, `thickness` along Z, centred. */
export function sawBlade(radius: number, thickness: number, teeth: number, toothDepth: number) {
  return cached(`blade:${radius}:${thickness}:${teeth}:${toothDepth}`, () => {
    const shape = new Shape();
    const step = (Math.PI * 2) / teeth;
    const inner = radius - toothDepth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      // Each tooth rises from the gullet to the tip over 80% of the pitch,
      // then drops straight back down: a clockwise rip-saw profile.
      const gullet = [Math.cos(a) * inner, Math.sin(a) * inner] as const;
      const tip = [Math.cos(a + step * 0.8) * radius, Math.sin(a + step * 0.8) * radius] as const;
      if (i === 0) shape.moveTo(...gullet);
      else shape.lineTo(...gullet);
      shape.lineTo(...tip);
    }
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 1 });
    geometry.translate(0, 0, -thickness / 2);
    return geometry;
  });
}

/**
 * Box with a sloped top, extruded from its side profile. Front (+X) edge is
 * `drop` lower than the back. Base on Y 0, centred in X and Z.
 */
export function slopedBox(size: Vec3, drop: number, bevel: number) {
  const [depth, height, width] = size;
  return cached(`sloped:${depth}:${height}:${width}:${drop}:${bevel}`, () => {
    const b = bevel;
    const shape = new Shape();
    // Inset the profile by the bevel so the outer size matches `size`.
    shape.moveTo(-depth / 2 + b, b);
    shape.lineTo(depth / 2 - b, b);
    shape.lineTo(depth / 2 - b, height - drop - b);
    shape.lineTo(-depth / 2 + b, height - b);
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, {
      depth: width - b * 2,
      bevelEnabled: b > 0,
      bevelSize: b,
      bevelThickness: b,
      bevelSegments: 3,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -(width - b * 2) / 2);
    return geometry;
  });
}

export function disposeSceneGeometries() {
  for (const geometry of cache.values()) geometry.dispose();
  cache.clear();
}
