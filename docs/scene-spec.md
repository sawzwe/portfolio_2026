# Sawmill hero: scene spec

The sawmill hero is a TresJS scene on the home page. Each plank is one entry of the career timeline, and the log being cut is the current role.

- **Visual spec:** `references/` (repo root, not deployed). `master.png` is the source of truth. Every other image refines one part of it, and where they disagree, master wins.
- **Numbers:** every dimension, position, colour, pose and timing lives in `app/sawmill/scene-config.ts`. This document explains where those numbers come from.
- **Content:** plank labels come from `app/sawmill/timeline.ts`.

Units: Y is up and the platform top is at Y 0. One plank is 200 × 40 × 80 (length × thickness × width) with a corner radius of 4. Logs travel along −Z into the saw.

---

## 1. What the references show

### master.png: composition

- **Camera:** orthographic. Ground edges slope about 26.5° on both sides, which is a 2:1 dimetric view: azimuth 45°, elevation 30°. Nothing has perspective. The scene fills about 90% of a 1376 × 768 frame.
- **Platform:** a light grey slab with rounded corners that holds everything. Measured with a 160-high worker as the ruler, it is about 920 × 900: nearly square, not the 2600 × 1800 in the brief (see §5).
- **Two parallel conveyors** run from screen bottom-left to top-right (−Z):
  - The front, **main** conveyor feeds the saw. Its log has seams and is cut under the gantry.
  - The **waiting** conveyor sits behind it (−X) with a full log of 7–8 segments. It ends just short of the gantry. This is the "what's next" log.
- **Saw gantry:** a grey box frame straddling the main conveyor near its −Z end. It has 4 posts, a rectangular top frame, an inner cross rail with a carriage block, and the blade hanging below.
  - The blade does a **rip cut**: its plane runs along the conveyor and it leaves a groove along the top of the log. The cross-cut in `mill-front.png` is not what master shows.
  - Blade diameter is about 0.85 × worker height.
- **Right of the gantry:** a large motor box with a round motor face, and in front of it a sloped control panel with buttons and a screen.
- **Far right:** a flat wooden desk with a grey monitor and a chair with a low backrest. A cream worker sits there facing the camera-left side.
- **Bottom centre:** the plank stack. Long planks run along Z in 3 side-by-side columns, about 6 layers high. Each top plank has the thin label groove.
- **Five workers:**

  | Who | Where | Pose and outfit |
  |---|---|---|
  | Operator | Small switch box at the start of the main conveyor | Standing, green |
  | Pusher | Main conveyor, +X side | Pushing the log into the saw, blue |
  | Panel | Control panel | Hands on the panel, cream |
  | Carrier | Walking from the saw to the stack | Carrying two planks, green |
  | Desk | The desk | Seated, cream |

- **Light and colour:** soft daylight from upper left, so pale shadows fall to the right. Matte, toy-like materials and rounded edges everywhere. The only sheen is a faint one on the blade. The background reads `#EAEBE5`; we keep `#F2F2F0` as the README says.

### storyboard.png and storyboard-1..4: the cut cycle

1. **Log at the saw.** The front segment sits under the blade, the pusher's hands are on it, and the carrier is mid-walk.
2. **Blade cutting.** Sawdust sprays from the cut on the pusher's side. Everything else is unchanged.
3. **Plank separated and carried.** The cut piece is gone from the log and the carrier holds a long plank. The log is one segment shorter.
4. **Plank on the stack.** The stack has a new plank and the log has advanced one segment towards the blade.

The storyboard frames are not consistent with master:
- Frames 3 and 4 drop the waiting conveyor.
- Frame 4 has a loose block on the floor.
- The stack moves between frames.

**We follow master's layout and use the storyboard only for the sequence of events.**

### exploded.png: primitives

- **Gantry:** 4 square posts, 2 long top beams (plus short ones), and a cross rail with a cube carriage. Thin guide rods stand next to the posts.
- **Blade:** a flat disc with sawtooth edges and a short cylinder hub.
- **Conveyor:** a rounded slab bed, about 6 cylinder rollers, and short square legs.
- **Motor:** a rounded cube.

Everything is a rounded box, a cylinder or an extruded shape. No models are needed.

### mill-views.png and mill-front, side, top, iso

- **Front (down the conveyor):** the gantry is about 2.5 × the blade diameter wide and the posts have small foot plates. The cross rail sits about 0.8 of the way up the posts and the carriage is centred.
- **Side:** the conveyor passes through the gantry and extends both ways. There are 3 leg pairs and the belt ends are rounded.
- **Top:** the gantry is a two-bay rectangle. The conveyor is about 1.3 × the gantry span long in this view; master makes it longer.
- **Iso:** confirms the gantry straddles the conveyor near one end.
- These views show the blade face-on from both the front and the side, which is impossible. Master's rip cut decides it.

### worker-turnaround.png and front, side, back, three-quarter

Measured at 160 tall:

| Part | Size | Notes |
|---|---|---|
| Shoe | 20 × 8 × 26 | Black, sticking out slightly in front |
| Leg | 20 × 48 × 20 | 2 apart |
| Torso | 48 × 50 × 28 | Wider than the head (1.2×) |
| Neck | 16 × 4 × 16 | Skin |
| Head | 40³ | |
| Hair | 46 × 12 × 46 cap | Plus side and back pieces hanging about halfway down the head, and a fringe notch slightly right of centre |
| Arm | 16 × 44 sleeve + 14 × 12 hand | One piece with no elbow; the hand is a skin-coloured block at the end |

- The arms hang about 10° away from the body.
- There's no face detail at all.
- The studio background is grey; ours stays `#F2F2F0`.

### poses.png and pose-1..5

1. **Standing:** neutral, arms slightly out.
2. **Pushing:** torso leans about 18°, both arms straight forward at chest height, back leg extended. Blue.
3. **Control panel:** almost upright, both arms forward and down onto the panel's sloped top. Cream.
4. **Carrying:** two planks stacked flat, held level at waist height across the body, mid-stride. Green.
5. **Seated:** thighs level, shins vertical, arms forward, on a low stool whose seat is at shin height. Cream.

Pose 5 needs a knee. The other poses only need hip and shoulder rotation.

### planks.png and plank-log, plank-single, plank-stack

- **Log:** a square-section beam split into near-cubic segments by thin dark seams. The end shows faint growth rings. `plank-log.png` shows 7 segments; ours has 8 (7 entries plus the blank "next").
- **Single plank:** long and flat with small rounded edges. A thin groove runs along the top face, inset from the edges and open at one end: **this is the label recess.**
- **Stack:** 3 columns side by side, about 6 layers. Only the top layer's grooves are visible. Lower layers show only their edges.

### props.png and prop-conveyor, control-panel, console, saw-blade

- **Conveyor:** a light belt wrapped around a slab with rounded ends. About 13 small rollers are visible on each side, with 3 pairs of square grey legs.
- **Control panel:** a grey box with a sloped top, 2 × 3 round light buttons and a small dark screen.
- **Console:** a slanted wooden writing desk with a grey stool. Master shows a flat desk with a monitor and a chair with a backrest instead. **Master wins.**
- **Saw blade:** 24 teeth, light grey disc, darker hub.

### Colours (sampled from the references, then converted back to unlit base colours)

| Element | Lit sample | Base colour |
|---|---|---|
| Wood top | `#E2C499` | `#E9CBA2` |
| Machine / gantry | `#B9BCBA` | `#D6D8DA` |
| Belt | `#D4D3CE` | `#E6E4DE` |
| Green clothes | `#95A38C` | `#A9BBA3` |
| Blue clothes | `#8D97A1` | `#B7C9DB` |
| Cream clothes | `#D3CAB1` | `#ECE4CF` |
| Skin | `#CFAD87` | `#E3C3A3` |
| Hair / shoes | `#262623` | `#1C1C1C` |
| Blade / hub | `#B3B4B4` / `#8D8A86` | `#C9CCCF` / `#6F7378` |

The lit samples are darker than the base colours because of shading. The final check is the side-by-side comparison in §4.

---

## 2. Component tree

All components live in `app/components/sawmill/` as `<script setup lang="ts">` SFCs.

```
SawmillCanvas              TresCanvas, renderer, clear colour, shadows on
├─ SawmillCamera           orthographic camera, frustum = canvas px, zoom fits CAMERA.fitBox
├─ SawmillLights           hemisphere + key (shadows) + fill + contact shadow
└─ SawmillScene            the root group; reads layout from scene-config
   ├─ Platform             RBox
   ├─ Conveyor ×2          props: position, role ("main" | "waiting")
   │  ├─ ConveyorBed       belt slab with rounded ends (RBox + 2 half-cylinders)
   │  ├─ ConveyorRollers   one InstancedMesh, both sides
   │  ├─ ConveyorLegs      one InstancedMesh
   │  └─ Log               props: segments, cut progress
   │     └─ LogSegment ×8  RBox; segment 0 = current entry, segment 7 = blank "next"
   ├─ SawGantry
   │  ├─ GantryFrame       posts, beams, rail, guide rods, feet (RBox; posts instanced)
   │  ├─ GantryCarriage    RBox, moves down while cutting
   │  └─ SawBlade          extruded 24-tooth disc + hub cylinder, spins
   ├─ MotorBox             RBox + motor face cylinder + side block
   ├─ ControlPanel         sloped box (extruded profile) + Buttons (instanced) + screen
   ├─ SwitchBox            RBox + 2 toggles
   ├─ Desk                 RBox top + legs, Monitor
   ├─ Stool                seat, 4 legs (instanced), backrest
   ├─ PlankStack           lays out STACKED_ENTRIES in 3 columns × 2 layers
   │  └─ Plank ×6          RBox + recess + PlankLabel; hover lift
   ├─ Sawdust              Points, active only while cutting
   └─ Worker ×5            props: pose, outfit, position, rotationY
      └─ WorkerBody
         ├─ Torso, Neck
         ├─ Head → Hair    cap + sides + back, fringe notch
         ├─ Arm ×2         shoulder pivot group → Sleeve + Hand
         ├─ Leg ×2         hip pivot → Thigh → knee pivot → Shin + Shoe
         └─ (carrying) CarriedPlanks, a slot parented to the hands

Shared building blocks
├─ RBox.vue                rounded box: size, radius, material name → cached geometry
├─ Plank.vue               RBox + recess groove + optional PlankLabel (used by stack, carrier, log cut)
└─ PlankLabel.vue          flat text in the recess (troika-three-text)

Outside the canvas (HTML)
├─ PlankCard.vue           detail card for the hovered/selected plank (motion lib allowed here only)
└─ SawmillDevOverlay.vue   dev only: "O" toggles master.png at 50% over the canvas
```

Code that isn't a component goes in `app/sawmill/`:

- `scene-config.ts`: constants (exists).
- `timeline.ts`: content (exists).
- `materials.ts`: the shared materials (§3).
- `geometries.ts`: a geometry cache keyed by shape and size. Each `RoundedBoxGeometry(w, h, d, segments, radius)` is built once and reused by every RBox with the same key.
- `poses.ts`: turns a `Pose` from the config into joint rotations and blends between two poses with maath `damp`.
- `useCutCycle.ts`: one clock for the storyboard cycle. It reports the phase and progress, plus segment and plank states. Built on the TresJS `useLoop().onBeforeRender` of the installed core (5.10).
  - In dev it exposes `window.__sawmill.setTime(t)` and reads `?t=` from the URL, so the screenshot script can freeze any frame.
  - With `prefers-reduced-motion` it shows frame 1 statically.

Notes on helpers available in the installed versions (core 5.10, cientos 5.10):

- **Rounded boxes:** cientos has `RoundedBox`, but we use `RoundedBoxGeometry` from `three/examples/jsm` through the geometry cache. Sixty-odd boxes share a dozen geometries instead of building one each, and the cache makes the base box sit at the right height.
- **Text:** cientos has `Text3D`, which needs a typeface JSON and builds extruded geometry; that's too heavy for small labels. cientos has no flat text component, so labels use `troika-three-text`, a new dependency added when planks are built.
- **Camera:** there's no cientos `OrthographicCamera`, so we keep our own `SawmillCamera` from Phase 1.
- **Other cientos pieces we'll use:** `ContactShadows` for the soft contact shadow and `Html` (only if the card needs to anchor to a plank).
- **Excluded:** the motion libraries never run inside the scene.

---

## 3. Materials

`app/sawmill/materials.ts` creates every material **once**, as a module-level map from colour name to one `MeshStandardMaterial`:

- **Matte (everything except the blade):** `roughness 0.72, metalness 0`, coloured from `COLORS`. That covers platform, machine, details, belt, wood, wood seam, screen, button, the three outfits, hair, skin, shoe and label.
- **Blade:** `roughness 0.38, metalness 0.35`.
- **Wood grain:** one small procedural `CanvasTexture` (256², faint stripes, 6% contrast) shared by every wood material. It reads as fine grain at hero scale without image downloads.

Rules:

- Components ask for a material by name (`material="wood"`) and never create their own.
- Clothes colour is the only per-instance choice, and it's still a lookup (`OUTFIT_COLOR[outfit]`), so all five workers share 3 cloth materials.
- Hover effects on planks change the plank's position, not its material. If a highlight is ever needed, use one shared `woodHover` material, not a clone per plank.
- `SawmillCanvas` disposes materials, the grain texture and cached geometries when it unmounts.
- Shadows: the key light casts, and everything except the platform casts. Only the platform and the conveyor beds receive shadows, which keeps the shadow pass cheap.
- **Expected budget:** about 15 materials and about 25 geometries, and under 120 draw calls (rollers, legs, buttons and stool legs are instanced).

---

## 4. Phases and how each one is verified

Every phase ends with the same checks:

1. `npm run shot -- phaseN-<name> --canvas --width 1376 --height 768`. This is the canvas only, at master's size and aspect ratio, so the two images line up.
2. A comparison image, `docs/screenshots/phaseN-<name>-compare.png`, with master and the render side by side and a 50% blend under them. This needs a new `--compare` flag on the screenshot script (built in phase 2).
3. The dev overlay ("O" key) for live alignment while tuning numbers. `master.png` is imported from `references/` only behind `import.meta.dev`, so it never reaches `public/` or the production bundle.
4. A mobile shot at 390 × 844 for framing.
5. `npm run typecheck` and `npm run build` pass. The shot script reports no console or page errors.
6. Numbers change only in `scene-config.ts`. If a tweak needs a hard-coded value in a component, it goes into the config first.

| Phase | Builds | Screenshot check |
|---|---|---|
| 2 Ground | Camera fit, lights, platform, both conveyors, logs, geometry cache, materials, overlay, `--compare` | Platform outline, conveyor angles and log positions match the master overlay |
| 3 Saw | Gantry, carriage, blade (static) | Gantry footprint, height and blade position match; blade groove on the log |
| 4 Props | Motor box, control panel, switch box, desk, monitor, stool | Silhouettes and positions against master |
| 5 Workers | WorkerBody, the 5 poses, placements | Each pose next to its `pose-N.png` (an extra shot per pose with the camera on the turnaround angle), then all five in place against master |
| 6 Planks | Plank, recess, labels from `timeline.ts`, the stack, carried planks | Stack against master; labels readable at 1376 and 390 wide; every entry from `TIMELINE` shown once |
| 7 Look | Shadows, contact shadow, wood grain, final colours | Blend image shows matching light direction and tone; colour samples within about 5% of master's lit values |
| 8 Motion | Cut cycle, sawdust, walking, blade spin | 4 frozen frames (`?t=` at each step) against `storyboard-1..4.png`; a reduced-motion shot shows frame 1 |
| 9 Interaction | Hover lift, `PlankCard`, keyboard focus, fallback image | Shots with a plank hovered and selected; the `ClientOnly` fallback regenerated from the final render |
| 10 Performance | Draw-call and frame budget | `renderer.info` logged in dev (draw calls < 120); 60 fps on a mid laptop; the three.js chunk stays out of non-home routes |

---

## 5. Decisions and conflicts

Status (2026-10-23): decisions 1–6 accepted as written. Items 7 and 8 are still open.

1. **Scale: brief vs master.**
   - The brief's starting values (conveyor 1600, platform 2600 × 1800, blade Ø200, belt top Y 100) make the machines about 2.5× larger relative to a 160 worker than master shows.
   - Master measures conveyor ≈ 4 × worker height and platform ≈ 5.8 × worker height. Its log segments are short cubes (about half a worker high), and the planks on the stack are long. So segment ≠ plank: in master a short segment becomes a long plank.
   - **The config follows master:**
     - Plank 200 × 40 × 80 and worker 160 stay fixed.
     - Log: 8 segments of 72 × 80 × 80 (590 long).
     - Conveyor 640, belt top Y 60.
     - Platform 940 × 920.
     - Blade Ø140, centre Y 150.
   - If you'd rather keep "one segment = one 200 plank, conveyor = 1600", the platform has to grow to about 2400 and the workers will read as small figures. That's a one-file change.
2. **Worker proportions** follow the turnaround: torso 48 × 50 × 28 (brief 40 × 48 × 24), legs 20 × 48 (brief 16 × 56), arms 16 × 44 plus a 12 hand. The total height is still 160.
3. **Stool:** the brief's 40³ stool would leave a seated worker's feet in the air, because the shins are only 24 long. Seat height is now derived from the leg (22), as in `pose-5-seated.png`. Master's chair also gets a low backrest.
4. **Plank thickness 40** is kept as the unit, though master's stacked planks look thinner (about 15–20). A 6-plank stack is 80 tall, which still reads as a stack.
5. **Blade orientation:** rip cut along the log, per master.
6. **Label font:** troika needs a font file. The site uses Helvetica Neue, which is a system font with no web licence. Proposal: self-host Inter (OFL) as one woff in `public/fonts/`, used only by the scene.
7. **Timeline content conflicts with the About page.** `app/data/timeline.ts` (and the CMS) says:
   - House of Griffin 2022 (here 2023)
   - PS Park 2023 (here 2024)
   - "Left the PM seat. Open to …" for 2026 (here "Technical PM · now")

   The home page role also reads "Technical Product Manager". One of the two needs updating before launch. The sawmill reads only `app/sawmill/timeline.ts`.
8. **Background:** the canvas is `#F2F2F0` but the page body is `#fcfcfb`, so the hero shows as a grey rectangle. Either the page goes to `#F2F2F0` on the home route, or the canvas becomes transparent over the page colour.
9. **Canvas aspect:** master is 1.79:1. The hero container on a 1440 × 900 screen is 1120 × 468 (2.4:1), so the camera fit has more width than master; fit is by height there. Phase 2 checks both aspects.

---

## 6. Build notes (phases 2–5)

What changed from the plan above while building:

- **Stack and timeline:** the stack holds every timeline entry, filled in cut order as the page scrolls: slot i is column i % 3, layer ⌊i / 3⌋. At the top of the page the stack is empty and the current role's segment is under the blade. With reduced motion everything is already stacked.
- **Motion:** driven by scroll, not by a timed loop. The hero section is one viewport tall per entry, with the canvas sticky inside it. Step windows, distances and smoothing are in `MOTION` in `scene-config.ts`, and the maths is in `app/sawmill/motion.ts`.
- **Carrier:** holds one plank, not two (`CARRY.planks`). Two 40-thick planks hide the worker.
- **Lights:** one shadow-casting directional light plus ambient, all materials matte. No contact shadow or fill light.
- **Framing:** the hero leaves 12% at the top, not master's 5%, for the page heading that overlays the top-left corner.
- **Dev tools:** none of these ship in production.
  - `?sawmill-lab=pose:<name>` and `?sawmill-lab=turnaround:<view>` render one worker framed like its reference image.
  - `?sawmill-step=<P>` pins the timeline at progress P.
  - "O" toggles the master overlay, served from a dev-only route.
- **Screenshots:** `npm run shot -- <name> [--step P] [--frame] [--compare] [--reference <png>]`.
- **Fallback still:** `npm run fallback` regenerates `app/assets/sawmill/hero-fallback.webp` (hashed by Vite, so it never shows stale) from the dev server on port 3000. While the scene loads, a saw-blade loader shows instead; the still only appears without WebGL or after a 10 s timeout.

### Revision (after review)

- **Sliced log, cross-cut saw:** the log is no longer cubes. It is 8 plank-shaped slices standing on edge, so the piece the saw cuts off *is* the plank: it tips flat, flies and lands. The blade stands across the log, and each cut lowers the head, slides it along the cross rail and raises it again. The conveyors are 214 wide to carry the 200-wide log.
- **Labels:** each plank shows only its year in large type. The full entry (title, org, year, detail) is an HTML tooltip that floats above its plank and follows it as it is cut, flies and lands. It shows the entry being cut at the current scroll step, the hovered or tapped plank, or "What's next" above the blank slice at the end. Hovered planks lift only visually; an invisible hit box stays in place so hovering doesn't flicker.
- **Scale:** `CAMERA.sceneScale` (0.85) shrinks the whole sawmill inside its frame.
- **Caption pin:** the tooltip is pinned to its plank with a circle on the plank's top face and a thin line up to the card (`MOTION.caption`). The line grows in when the caption appears and shortens near the top of the canvas; near the edges the card slides sideways while the pin stays on the plank.
- **Idle life (`MOTION.idle`, `MOTION.dust`, `LIGHTS.fog`):**
  - Workers breathe and the standing operator shifts weight; the panel worker taps buttons and the desk worker types.
  - With no cursor on the scene, heads glance around slowly.
  - The main conveyor's rollers turn as the log advances.
  - Dust drifts in the air, and a light haze fades the back of the scene for depth.
  - All of it is off with reduced motion.
