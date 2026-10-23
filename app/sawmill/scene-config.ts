// sawmill/scene-config.ts
// Single source of truth for the sawmill hero scene: every dimension, position,
// colour, pose and timing lives here as a named constant. Components read from
// this file and never hard-code numbers.
//
// Visual spec: references/master.png (repo root, not deployed).
// Reasoning behind each value: docs/scene-spec.md.
//
// Units and axes
//   - One plank = 200 x 40 x 80 (length x thickness x width), corner radius 4.
//   - Y is up. The platform top is Y 0. Origin is the platform centre.
//   - Z runs along the conveyors. Logs travel towards -Z, into the saw.
//   - X runs across the conveyors. The waiting conveyor is at -X, the plank
//     stack, control panel and desk are towards +X.
//   - Sizes are [x, y, z] unless named otherwise. Rotations are radians.
//   - With the camera at azimuth 45°, +X points to screen bottom-right and
//     +Z to screen bottom-left, matching master.png.


type Vec3 = [number, number, number];

const deg = (d: number) => (d * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Colours
// Base colours (albedo), not the lit colours you see in master.png.
// ---------------------------------------------------------------------------

export const COLORS = {
  // Page and canvas background. master.png reads #EAEBE5; we keep the brief's
  // #F2F2F0 (references/README.md).
  background: "#F2F2F0",
  platform: "#DCDEDC",
  machine: "#D6D8DA",
  // Motor box and control panel read darker than the gantry in master.png.
  machineDark: "#B9BDC0",
  details: "#A9ADB1",
  // Conveyor belt is lighter and warmer than the machine grey in master.png.
  belt: "#E6E4DE",
  // Warmer and more saturated than the brief's #E9CBA2, to match master.png.
  wood: "#EEC995",
  // Seams between log segments and the label recess on planks.
  woodSeam: "#C9A47A",
  blade: "#C9CCCF",
  bladeHub: "#6F7378",
  screen: "#4B5157",
  button: "#ECECE8",
  clothesGreen: "#A9BBA3",
  clothesBlue: "#B7C9DB",
  clothesCream: "#ECE4CF",
  hair: "#1C1C1C",
  // Warmer than the brief's #E3C3A3, which lit up grey next to the references.
  skin: "#EBC29A",
  shoe: "#1C1C1C",
  // Plank label text, printed into the recess.
  label: "#4A4A48",
  // AI robot workers (references/ai/).
  robotBody: "#D9DBDD",
  robotJoint: "#6F7378",
  robotVisor: "#2B2D2C",
  robotBadge: "#E6E8E9",
  robotGreen: "#A9BBA3",
  robotBlue: "#B7C9DB",
  robotIndigo: "#B5BCE0",
  robotSand: "#E2CDA8",
} as const;

export type ColorName = keyof typeof COLORS;

// ---------------------------------------------------------------------------
// Materials: one shared MeshStandardMaterial per entry (see materials.ts).
// ---------------------------------------------------------------------------

export const MATERIAL = {
  // Soft, matte, toy-like. Every material in the scene, the blade included.
  matte: { roughness: 0.8, metalness: 0 },
  // Real wood grain: a grey grain map made from ambientCG's Wood095 (CC0),
  // multiplied with COLORS.wood so the palette stays as authored. Rounded
  // boxes get box-projected UVs in world units, so one tile covers this many
  // units on every face and the grain runs along each box's Z (a plank's length).
  woodGrain: { url: "/sawmill/wood-grain.webp", tileSize: 220 },
} as const;

// Post-processing (pmndrs postprocessing via @tresjs/post-processing).
export const POST = {
  // Ambient occlusion (N8AO): soft darkening where objects meet, like
  // master.png. Desktop only (fine pointer, wide screen): it costs GPU time.
  ao: {
    enabledQuery: "(min-width: 768px) and (pointer: fine)",
    aoRadius: 28, // world units
    distanceFalloff: 1.2,
    intensity: 3,
    aoSamples: 16,
    denoiseSamples: 8,
    denoiseRadius: 12,
    halfRes: true,
  },
  // Tilt-shift: the top and bottom of the frame go slightly soft, so the
  // scene reads as a miniature. A wide focus band keeps the plank years sharp.
  tiltShift: {
    focusArea: 0.8, // fraction of the height kept sharp
    feather: 0.22,
    // Band centre; negative moves it down, so the stack and its years stay
    // sharp while the gantry top and the platform's front corner soften.
    offset: -0.12,
    rotation: 0,
  },
  multisampling: 4,
} as const;

export const RENDERER = {
  // No tone mapping: the base colours above should come out as authored,
  // like master.png's flat pastel look. (Tres defaults to ACES Filmic.)
  toneMapping: "none" as "none" | "aces" | "agx" | "neutral",
  exposure: 1,
  dpr: [1, 2] as [number, number],
} as const;

// ---------------------------------------------------------------------------
// Camera and framing
// ---------------------------------------------------------------------------

export const CAMERA = {
  // master.png's platform diamond is ~1.87:1 wide, i.e. elevation ~32°
  // (a true 2:1 dimetric would be 30°), seen from azimuth 45°.
  azimuth: deg(45),
  elevation: deg(32),
  // Orthographic, so distance only has to clear the scene.
  distance: 3000,
  near: 1,
  far: 6000,
  // Fraction of the canvas left free on each side when fitting the scene.
  // master.png has ~5% above the gantry; the hero leaves 12% so the page
  // heading, which overlays the top-left corner, clears the gantry and logs.
  // The bottom 15% holds the Base / Focus / Index row on desktop.
  fitMargin: { top: 0.12, bottom: 0.15, left: 0.05, right: 0.05 },
  // Overall size of the scene inside that area: 1 fills it, smaller values
  // shrink the whole sawmill around the same centre.
  sceneScale: 0.92,
} as const;

// ---------------------------------------------------------------------------
// Lights
// Master.png: soft daylight from upper left, light shadows falling to the
// right, no hard edges.
// ---------------------------------------------------------------------------

export const LIGHTS = {
  ambient: { color: "#FFFFFF", intensity: 0.55 },
  // Image-based light from a small studio HDRI (Poly Haven, CC0): softer,
  // more varied shading than ambient alone. Lighting only, not a backdrop.
  environment: { url: "/sawmill/studio_small_08_1k.hdr", intensity: 0.3 },
  // Light haze towards the back of the scene for depth: parts further from
  // the camera fade a little into the background colour.
  fog: { near: 2900, far: 6600 },
  // One soft directional light from the top left of the screen (-X, +Z, high).
  key: {
    color: "#FFFFFF",
    // Mostly from screen-left (+Z) so the faces towards the camera's left
    // stay bright and the +X faces fall into soft shade, as in master.png.
    position: [-500, 1300, 700] as Vec3,
    intensity: 2.0,
    shadow: {
      mapSize: 2048,
      radius: 8, // PCF blur radius in texels
      intensity: 0.6, // master.png's shadows are soft but clearly there
      bias: -0.0005,
      normalBias: 0.6,
      // Orthographic shadow camera bounds around the origin.
      extent: 640,
      near: 100,
      far: 3200,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Plank (the unit) and log
// ---------------------------------------------------------------------------

export const PLANK = {
  length: 200, // along Z when on the stack or conveyor
  thickness: 40,
  width: 80,
  radius: 4,
  // The label recess on the top face (plank-single.png): a thin groove
  // inset from the edges, open towards one end.
  recess: { inset: 10, grooveWidth: 3, depth: 1, openEnd: 36 },
  label: {
    // Only the year is printed on the plank, large enough to read; the full
    // entry shows in the HTML caption beside the scene.
    fontSize: 34,
    minFontSize: 18, // auto-fit shrinks long years ("2020–24") down to this
    maxWidth: 160, // along the plank length, inside the groove
    letterSpacing: 0,
    // Lift above the top face to avoid z-fighting.
    lift: 0.4,
  },
} as const;

/** Plank size as [x, y, z] when lying along Z. */
export const PLANK_SIZE: Vec3 = [PLANK.width, PLANK.thickness, PLANK.length];

/**
 * The log is a sliced block. On the main conveyor it has one slice per
 * timeline entry (from the CMS, so the count can change) plus the blank
 * "next" one. Each slice is a plank standing on edge across the conveyor
 * (length along X, width up, thickness along Z), so the piece the saw cuts off
 * is the plank itself: it tips over flat and goes to the stack.
 */
export const LOG = {
  seamGap: 2,
  // The waiting log on the second conveyor is decoration ("what's next"):
  // a fixed number of blank slices, whatever the timeline length.
  waitingSlices: 8,
} as const;

/** Distance from one slice to the next along the log (Z). */
export const LOG_PITCH = PLANK.thickness + LOG.seamGap;
/** Length of a log with `slices` slices. */
export const logLength = (slices: number) => slices * PLANK.thickness + (slices - 1) * LOG.seamGap;
/** The log's height and width come from a plank on edge. */
export const LOG_HEIGHT = PLANK.width;
export const LOG_WIDTH = PLANK.length;

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------

export const PLATFORM = {
  // master.png: the edge along X reads ~1.09x the edge along Z.
  size: [960, 30, 880] as Vec3,
  radius: 12,
  topY: 0,
} as const;

// ---------------------------------------------------------------------------
// Conveyors
// ---------------------------------------------------------------------------

export const CONVEYOR = {
  // Bed: belt wrapped around a rounded slab (prop-conveyor.png).
  length: 560, // along Z
  // Wide enough for the log: a plank's length plus a margin either side.
  width: 214, // along X
  bedThickness: 20,
  // Belt top height. master.png: about hip height on a 160 worker.
  topY: 60,
  endRadius: 9, // the rounded belt ends (just under half the bed thickness)
  rollers: { count: 13, radius: 7, length: 5 }, // visible on both sides, subtle
  legs: { thickness: 16, pairs: 3, inset: 50, sideInset: 14 }, // height = topY - bed
} as const;

export const CONVEYORS = {
  // Main conveyor feeds the saw and runs on under the gantry.
  main: { position: [-60, 0, 50] as Vec3 },
  // Waiting conveyor, parallel, behind the main one (-X). It holds the
  // "what's next" log and ends short of the gantry.
  waiting: { position: [-330, 0, 170] as Vec3, length: 420 },
} as const;

// ---------------------------------------------------------------------------
// Saw gantry and blade
// ---------------------------------------------------------------------------

export const GANTRY = {
  // Box frame straddling the main conveyor (mill-front/side/iso.png).
  position: [-60, 0, -170] as Vec3,
  span: 350, // across the conveyor (X), outside of posts
  depth: 110, // along the conveyor (Z), outside of posts
  post: { size: [24, 300, 24] as Vec3 },
  topBeam: { thickness: 24 },
  // Inner rail across the frame, under the top beams. The saw head's
  // carriage slides along it (X) to cut across the log.
  crossRail: { thickness: 14, y: 272 },
  // Thin guide rods next to each post (exploded.png).
  guideRod: { thickness: 8, offset: 20 },
  carriage: { size: [44, 34, 44] as Vec3 },
  // Small foot plates under each post.
  foot: { size: [36, 6, 36] as Vec3 },
} as const;

export const BLADE = {
  // Cross cut: the blade stands in the XY plane, at the seam behind the front
  // slice, and the head slides across the log along the cross rail.
  radius: 60, // Ø120
  thickness: 6,
  teeth: 24, // prop-saw-blade.png
  toothDepth: 7,
  hub: { radius: 16, thickness: 12 },
  // Centre height while cutting: the blade reaches just below the log
  // (Y 60 to 140) so the slice comes off cleanly.
  centerY: 116,
  // Offset along Z from the gantry centre.
  offsetZ: 0,
  // How far the head slides either side of the log's centre line during a
  // cut: half the log width plus enough for the blade to clear its edges.
  traverse: 125,
  // Telescoping arm from the carriage down to the hub, beside the blade.
  arm: { thickness: 10 },
} as const;

/** Z of the blade, in world space: the seam behind the slice being cut. */
export const BLADE_Z = GANTRY.position[2] + BLADE.offsetZ;

/**
 * Points the camera keeps in frame: the platform slab's corners and the top
 * corners of the gantry. Zoom and centring are computed at runtime so these
 * fill the canvas minus CAMERA.fitMargin, like master.png's framing.
 */
export const CAMERA_FIT_POINTS: readonly Vec3[] = (() => {
  const [pw, ph, pd] = PLATFORM.size;
  const [gx, , gz] = GANTRY.position;
  const gy = GANTRY.post.size[1];
  const points: Vec3[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      points.push([(sx * pw) / 2, PLATFORM.topY, (sz * pd) / 2]);
      points.push([(sx * pw) / 2, PLATFORM.topY - ph, (sz * pd) / 2]);
      points.push([gx + (sx * GANTRY.span) / 2, gy, gz + (sz * GANTRY.depth) / 2]);
    }
  }
  return points;
})();

// ---------------------------------------------------------------------------
// Machines and furniture
// ---------------------------------------------------------------------------

export const MOTOR_BOX = {
  // Wider than tall in master.png.
  size: [130, 100, 90] as Vec3,
  radius: 10,
  position: [100, 0, -375] as Vec3,
  // Round motor face on the +Z side and a smaller block on the -Z side (master.png).
  motorFace: { radius: 30, depth: 16 },
  sideBlock: { size: [40, 50, 30] as Vec3 },
} as const;

export const CONTROL_PANEL = {
  // Grey box with a sloped top, 2x3 buttons and a screen (prop-control-panel.png).
  // x = front-to-back (front at +x), z = width.
  size: [70, 125, 90] as Vec3,
  slopeDrop: 30, // how much lower the front edge of the top is
  radius: 6,
  position: [155, 0, -215] as Vec3,
  rotationY: deg(0), // the low front edge faces +X, towards the operator
  buttons: { rows: 2, cols: 3, radius: 4, depth: 3, gap: 11 },
  screen: { size: [22, 2, 18] as Vec3 }, // lies on the slope
} as const;

export const SWITCH_BOX = {
  // Small box with toggles at the start of the main conveyor (master.png).
  size: [50, 50, 40] as Vec3,
  radius: 4,
  position: [80, 0, 300] as Vec3,
  toggle: { size: [6, 14, 6] as Vec3, count: 2 },
} as const;

export const DESK = {
  // master.png shows a flat wooden desk with a monitor; prop-console.png's
  // slanted writing desk is an earlier variant. Master wins.
  size: [140, 75, 80] as Vec3,
  topThickness: 10,
  sideThickness: 10,
  radius: 4,
  position: [354, 0, -284] as Vec3,
  rotationY: deg(0),
  // Faces -Z, towards the seated worker.
  monitor: { size: [56, 38, 6] as Vec3, stand: [8, 12, 8] as Vec3, base: [26, 3, 16] as Vec3 },
} as const;


// ---------------------------------------------------------------------------
// Plank stack
// ---------------------------------------------------------------------------

export const STACK = {
  // Every timeline entry ends up here, in the order it is cut: slot i is
  // column i % columns, layer floor(i / columns).
  columns: 3,
  gap: 6, // between columns
  position: [305, 0, 225] as Vec3,
} as const;

// ---------------------------------------------------------------------------
// Worker
// Proportions measured from worker-turnaround.png and scaled to 160 tall.
// Stack from the floor: shoe 8 + leg 48 + torso 50 + neck 4 + head 40 + hair 10.
// ---------------------------------------------------------------------------

export const WORKER = {
  height: 160,
  radius: 4, // all body parts are rounded boxes
  shoe: { size: [20, 8, 26] as Vec3, forward: 3 },
  leg: {
    size: [20, 48, 20] as Vec3,
    gap: 2,
    // Legs split at the knee so the seated pose can bend.
    kneeRatio: 0.5,
  },
  torso: { size: [48, 50, 28] as Vec3, radius: 6 },
  neck: { size: [16, 4, 16] as Vec3 },
  head: { size: [40, 40, 40] as Vec3 },
  hair: {
    // One block over the top of the head, wider than the head, reaching
    // `overlap` down over the forehead (worker-front.png). Top lands at 160.
    cap: [48, 20, 48] as Vec3,
    overlap: 10,
    // Over the back ~55% of the head, down to the jaw line at the back and
    // sides (worker-side.png, worker-back.png).
    back: [48, 34, 26] as Vec3,
    // Thin slit in the fringe, right of centre, showing the forehead.
    notch: { width: 3, height: 8, offsetX: 4 },
  },
  arm: {
    sleeve: [16, 44, 16] as Vec3,
    hand: [14, 12, 14] as Vec3,
    // Arms hang away from the body in the rest pose (worker-front.png).
    restSpread: deg(16),
    // Shoulder pivots sit this far inside the sleeve's outer position, so the
    // arm tops tuck against the torso.
    shoulderInset: 4,
  },
} as const;

// Seat height follows from the worker: shin + shoe, minus half the thigh, so a
// seated worker's feet touch the floor (pose-5-seated.png has a low stool).
const SHIN_LENGTH = WORKER.leg.size[1] * (1 - WORKER.leg.kneeRatio);
const SEAT_TOP = SHIN_LENGTH + WORKER.shoe.size[1] - WORKER.leg.size[2] / 2;

export const STOOL = {
  // Behind the desk; the seated worker faces +Z, towards the desk.
  position: [354, 0, -349] as Vec3,
  seat: [40, 6, 40] as Vec3,
  height: SEAT_TOP, // 22, to the top of the seat
  legThickness: 6,
  // master.png's chair has a low backrest.
  backrest: { size: [40, 34, 6] as Vec3 },
} as const;

export type Outfit = "green" | "blue" | "cream";

export const OUTFIT_COLOR: Record<Outfit, ColorName> = {
  green: "clothesGreen",
  blue: "clothesBlue",
  cream: "clothesCream",
};

/**
 * Joint angles per pose. Positive X rotation swings a limb forward.
 * Shoulder and hip angles are per side; knee bends the shin back.
 */
export interface Pose {
  torsoLean: number;
  shoulderL: number;
  shoulderR: number;
  armSpread: number;
  hipL: number;
  hipR: number;
  kneeL: number;
  kneeR: number;
  // Lowers the body for the seated pose.
  pelvisDrop: number;
}

export const POSES = {
  // robot-pose-1-switch.png: right hand forward and down on the switch lever.
  switch: {
    torsoLean: deg(4), shoulderL: deg(4), shoulderR: deg(42), armSpread: deg(10),
    hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, pelvisDrop: 0,
  },
  // pose-1-standing.png
  standing: {
    torsoLean: 0, shoulderL: 0, shoulderR: 0, armSpread: WORKER.arm.restSpread,
    hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, pelvisDrop: 0,
  },
  // pose-2-pushing.png: slight lean, both arms level and straight forward
  // (shoulder angle = 90° + lean), front leg under the body, back leg out.
  pushing: {
    torsoLean: deg(10), shoulderL: deg(98), shoulderR: deg(94), armSpread: deg(3),
    hipL: deg(4), hipR: deg(-30), kneeL: 0, kneeR: 0, pelvisDrop: 6,
  },
  // pose-3-control-panel.png: upright, forearms reaching down to the panel.
  controlPanel: {
    torsoLean: deg(6), shoulderL: deg(40), shoulderR: deg(30), armSpread: deg(6),
    hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, pelvisDrop: 0,
  },
  // pose-4-carrying.png: plank held low across the body, mid-stride.
  carrying: {
    torsoLean: deg(4), shoulderL: deg(30), shoulderR: deg(30), armSpread: deg(2),
    hipL: deg(20), hipR: deg(-16), kneeL: 0, kneeR: 0, pelvisDrop: 2,
  },
  // pose-5-seated.png: thighs level, shins down, arms forward to the desk.
  seated: {
    torsoLean: 0, shoulderL: deg(55), shoulderR: deg(50), armSpread: deg(4),
    hipL: deg(90), hipR: deg(90), kneeL: deg(-90), kneeR: deg(-90),
    // Standing hip height minus seated hip height (seat top + half a thigh).
    pelvisDrop: WORKER.shoe.size[1] + WORKER.leg.size[1] - (SEAT_TOP + WORKER.leg.size[2] / 2),
  },
} as const satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

// ---------------------------------------------------------------------------
// AI robot workers (references/ai/robot-*.png)
// Floating: no legs, the torso hovers above the floor with a soft glow
// underneath. Heights from the floor: hover 26 + torso 60 + neck 6 + head 48.
// ---------------------------------------------------------------------------

export const ROBOT = {
  hover: 26, // gap between the floor and the bottom of the torso
  bob: { amplitude: 3, speed: 2.2 }, // idle float, world units / rad/s
  radius: 6,
  // The whole torso is the accent colour so each robot reads from any angle
  // (the scene camera mostly sees their sides and backs); a thin grey trim
  // down each side keeps the reference's two-tone look.
  torso: { size: [50, 60, 32] as Vec3, radius: 9, trim: { width: 3, depth: 8 } },
  chestBadge: { radius: 13, depth: 2, y: 0.58 }, // y: fraction of torso height
  neck: { size: [18, 6, 18] as Vec3 },
  head: { size: [54, 48, 48] as Vec3, radius: 11 },
  visor: { size: [38, 11, 2] as Vec3, y: 0.5 }, // y: fraction of head height
  headBadge: { size: [12, 10, 2] as Vec3, y: 0.8 },
  earModule: { size: [4, 13, 13] as Vec3, y: 0.55 },
  arm: {
    sleeve: [15, 46, 15] as Vec3,
    hand: [13, 11, 13] as Vec3,
    restSpread: deg(12),
    shoulderInset: 2,
  },
  // Thruster plate under the torso and the light pool it casts on the floor.
  glow: { color: "#CFEAF5", plateRadius: 14, floorRadius: 34, floorOpacity: 0.55 },
} as const;

export type RobotAccent = "robotGreen" | "robotBlue" | "robotIndigo" | "robotSand";

/** Logo shown on a robot's head and chest badges: an image in public/ (SVG or
 *  PNG, transparent background), or null for a blank badge. */
export interface RobotBadge {
  model: string;
  logo: string | null;
}

export interface WorkerPlacement {
  id: string;
  pose: PoseName;
  position: Vec3;
  rotationY: number;
  /** The human (you, at the desk) or one of the AI robots. */
  kind: "human" | "robot";
  outfit?: Outfit; // human only
  accent?: RobotAccent; // robot only
  badge?: RobotBadge; // robot only
}

// Positions read off master.png / master-ai.png. rotationY 0 faces +Z
// (screen bottom-left); -90° faces -X (screen top-left).
// Logos: put the files in public/sawmill/logos/ and set `logo`, e.g.
// "/sawmill/logos/openai.svg". Until then the badges are blank.
export const WORKERS: readonly WorkerPlacement[] = [
  // At the switch box at the start of the main conveyor, facing it.
  {
    id: "operator", kind: "robot", pose: "switch", accent: "robotGreen",
    badge: { model: "GPT", logo: null },
    position: [128, 0, 300], rotationY: deg(-90),
  },
  // Pushing the log into the saw, on the +X side of the main conveyor.
  {
    id: "pusher", kind: "robot", pose: "pushing", accent: "robotBlue",
    badge: { model: "Gemini", logo: null },
    position: [96, 0, -60], rotationY: deg(-95),
  },
  // At the control panel, facing its low front edge.
  {
    id: "panel", kind: "robot", pose: "controlPanel", accent: "robotIndigo",
    badge: { model: "DeepSeek", logo: null },
    position: [225, 0, -215], rotationY: deg(-90),
  },
  // Carrying a plank from the saw towards the stack.
  {
    id: "carrier", kind: "robot", pose: "carrying", accent: "robotSand",
    badge: { model: "Fourth model", logo: null },
    position: [360, 0, -30], rotationY: deg(-20),
  },
  // You, seated at the desk facing +Z, supervising.
  { id: "desk", kind: "human", pose: "seated", outfit: "cream", position: STOOL.position, rotationY: deg(0) },
];

/**
 * Planks held in the carrying pose (pose-4-carrying.png), relative to the waist.
 * The reference shows two thin planks; two of our 40-thick planks stack 82 tall
 * and hide the worker, and each cut yields one plank, so the carrier holds one.
 */
export const CARRY = {
  planks: 1,
  gap: 2,
  // Height of the bottom plank's underside relative to the waist (below it,
  // so the torso stays visible), and how far in front of the waist the
  // plank's centre line is. The hands sit just under the plank.
  height: -12,
  forward: 56,
} as const;

// ---------------------------------------------------------------------------
// Motion (storyboard-1..4.png), driven by page scroll.
//
// The hero section is one viewport tall per timeline entry, with the canvas
// sticky inside it. Scroll progress P runs from 0 to the number of timeline
// entries (from the CMS, newest first); step k
// (P in [k, k+1]) cuts log segment k and stacks its plank:
//   1 cut      the blade drops through segment k and rises again
//   2 lift     the segment becomes a plank and rises off the log
//   3 travel   the plank arcs over to its stack slot
//   4 land     it drops onto the slot and settles
//   5 advance  the log moves forward one segment (overlaps landing)
// Phase windows are fractions of one step. Distances are world units,
// times seconds, angles radians.
// ---------------------------------------------------------------------------

export const MOTION = {
  phases: {
    cut: [0, 0.34],
    lift: [0.34, 0.46],
    travel: [0.46, 0.8],
    land: [0.8, 0.96],
    advance: [0.72, 1],
    // The raised head slides back to the start side after each cut.
    headReturn: [0.34, 0.7],
  },
  // Scroll is smoothed with maath's damp: time to cover most of the distance.
  scrollSmoothTime: 0.35,
  blade: {
    // Spin speed, revolutions per second; faster while cutting.
    idleRps: 1.1,
    cuttingRps: 3.2,
    // How far above its cutting height the saw head rests between cuts: the
    // blade then just touches the top of the log (storyboard-1.png).
    raise: 84,
    // Within the cut window: lower, slide across, raise (fractions of it).
    lowerEnd: 0.2,
    slideEnd: 0.8,
  },
  plank: {
    liftHeight: 70, // above the log top
    travelArc: 90, // extra height at the middle of the arc
    travelTilt: deg(10), // roll at the middle of the arc
    dropHeight: 40, // above the slot when landing starts
    settleBounce: 4, // little hop after touching down
    hoverLift: 14, // hovered or selected plank rises this much
    hoverSmoothTime: 0.12,
  },
  // The HTML caption floats above its plank like a tooltip.
  // The HTML caption is pinned to its plank: a small circle on the plank's top
  // face with a thin line up to the card.
  caption: {
    lineLength: 56, // px from the circle up to the card
    minLineLength: 18, // shortened to this near the top of the canvas
    edgeMargin: 12, // px kept between the card and the canvas edges
  },
  heads: {
    // Heads turn towards the cursor (projected onto a plane at head height),
    // clamped to this angle either side.
    maxYaw: deg(35),
    smoothTime: 0.25,
    planeY: 140,
  },
  pusher: {
    // Extra forward lean at the middle of each cut.
    cutLean: deg(9),
  },
  // Idle life, always on (except with reduced motion). Speeds in rad/s.
  idle: {
    breathe: { amplitude: 0.8, speed: 1.9 }, // torso rise, world units
    sway: { amplitude: deg(2), speed: 0.7 }, // standing weight shift
    tap: { amplitude: deg(6), speed: 3.4 }, // panel worker pressing buttons
    typing: { amplitude: deg(3.5), speed: 9 }, // desk worker typing
    // With no cursor on the scene, heads glance around slowly.
    glance: { amplitude: deg(22), speed: 0.33 },
  },
  // Dust drifting in the air above the platform.
  dust: {
    count: 70,
    size: 2.4,
    // Volume it drifts in (world units), and drift speed range (units/s).
    volume: { x: 420, yMin: 20, yMax: 300, z: 400 },
    rise: [4, 12] as [number, number],
    sway: 10,
  },
  // Sawdust spraying up and out of the cut (storyboard-2.png).
  sawdust: {
    count: 48,
    size: 5,
    lifetime: 0.6, // seconds per particle
    speed: [100, 230] as [number, number], // initial speed range
    gravity: 420,
    // Spray direction: mostly +Z (out of the log's front, towards the
    // camera's left), upwards, fanned by this angle.
    spread: deg(55),
  },
} as const;

