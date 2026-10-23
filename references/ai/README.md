# Reference images: AI robot workers

Generated with Gemini from the prompts in the session that started this branch (`feature/ai-workers`). They replace the human workers in `../worker-*.png` and `../pose-*.png`; everything else in `../` (mill, planks, props, palette) still applies. `master-ai.png` updates `../master.png` for the workers only.

| File | Use it for |
|---|---|
| `robot-turnaround.png` + `robot-front.png`, `robot-side.png`, `robot-back.png`, `robot-three-quarter.png` | Robot proportions: head, visor, badges, torso, arms |
| `robot-poses.png` + `robot-pose-1-switch.png` … `robot-pose-4-carrying.png` | The four jobs: at the switch box, pushing the log, at the control panel, carrying a plank |
| `supervisor.png` + `supervisor-three-quarter.png`, `supervisor-side.png` | The one human (Saw) seated at the desk with a monitor, supervising |
| `master-ai.png` | Whole-scene mood: robots in place, the human at the desk, robots hovering |

## What the images show

- **No legs: the robots float.** The torso ends flat at the bottom and hovers above the floor; `master-ai.png` shows a soft glow underneath each one.
- **Head:** rounded cube about as wide as the torso, on a short dark neck. A dark rectangular visor across the front, a small square badge above the visor, and a square module on each side of the head (like ears). The back of the head is plain.
- **Torso:** rounded box in the accent colour, with a large round light-grey chest badge. Shoulders and sides are light grey.
- **Arms:** one-piece light-grey sleeves hanging slightly out from the body, ending in a small block hand.
- **Accent colours** (left to right in `robot-poses.png`): green `#A9BBA3`, blue `#B7C9DB`, indigo `#B5BCE0`, sand `#E2CDA8`.
- **Jobs in `master-ai.png`:** green at the switch box, blue pushing the log, indigo at the control panel, sand carrying a plank. The human sits at the desk on the right.
- **Logos:** the badges are deliberately blank. The real model logos go onto the head and chest badges in 3D, from SVG.

## Ignore

- Text on the planks in `master-ai.png` (the years come from the CMS timeline).
- The grid and grey studio background in the turnaround; the scene background stays `#F2F2F0`.
- Wood details that differ from `../plank-*.png`, and the slanted chair: the stool in the scene stays as built.
