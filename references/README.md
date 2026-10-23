# Reference images — Sawmill hero

Visual spec for the sawmill hero scene, built with TresJS (`@tresjs/core` + `@tresjs/nuxt`, Vue/Nuxt) inside this Nuxt app. These images live at the repo root, outside `public/`, so they are never deployed with the site. `master.png` is the source of truth for composition, camera angle and look. Every other image refines one part of it.

| File | Use it for |
|---|---|
| `master.png` | Target composition, isometric camera angle, palette, overall look |
| `storyboard.png` + `storyboard-1..4.png` | The cut sequence: 1 log at the saw → 2 blade cutting → 3 plank separated and carried → 4 plank on the stack, log advanced |
| `exploded.png` | Which primitive makes up each machine part |
| `mill-views.png` + `mill-front.png`, `mill-side.png`, `mill-top.png`, `mill-iso.png` | Saw gantry and conveyor proportions, orthographic views |
| `worker-turnaround.png` + `worker-front.png`, `worker-side.png`, `worker-back.png`, `worker-three-quarter.png` | Worker proportions (head, hair block, torso, limbs, shoes) |
| `poses.png` + `pose-1-standing.png` … `pose-5-seated.png` | The five worker poses: standing, pushing, at the control panel, carrying two planks, seated at the console |
| `planks.png` + `plank-log.png`, `plank-single.png`, `plank-stack.png` | Log segments with seams, plank label recess, stack layout |
| `props.png` + `prop-conveyor.png`, `prop-control-panel.png`, `prop-console.png`, `prop-saw-blade.png` | Conveyor with rollers, motor box with control panel, console desk with stool, saw blade |

## Notes
- `master.png` shows **two conveyors**: one feeding the saw and a second one behind it holding a waiting log. The second log can be the "what's next" part of the timeline.
- The images contain no text. Plank titles come from the timeline data and are rendered in 3D. Timeline and scene config live in the repo's shared-code location (`app/sawmill/`), not `lib/`.
- `worker-turnaround.png` has a grey studio background. The scene background stays #F2F2F0.
