# Articulated morning runner

Native SVG drawing authored specifically for the Running Hackathon local concepts. It is a new vector study, not a trace of the existing generated sketch PNG. Transparent 360 × 420 artboard; profile faces right. Fine ink contours, small anatomical/fabric hatching, cream singlet, charcoal short shorts and brick-orange shoes. No filters, masks, embedded images, text, CSS classes or external dependencies.

## Joint hierarchy and pivots

All coordinates below are in the immediate parent's local space. SVG rotation angles are degrees, clockwise in screen coordinates. Each group's own origin `(0, 0)` is the intended rotation pivot. Limb shapes extend mainly along their local positive y axis.

```text
runner                         translate(190, 221) — near hip / body origin
├─ rear-upper-arm              translate(16, -105), rotate(-43°) — rear shoulder
│  └─ rear-lower-arm            translate(0, 53), rotate(-92°) — rear elbow
├─ rear-upper-leg              translate(-9, 3), rotate(43°) — rear hip
│  └─ rear-lower-leg            translate(0, 84), rotate(76°) — rear knee
│     └─ rear-shoe              translate(0, 76), rotate(-10°) — rear ankle
├─ front-upper-leg             translate(1, 1), rotate(-37°) — near hip
│  └─ front-lower-leg           translate(0, 85), rotate(9°) — near knee
│     └─ front-shoe             translate(0, 76), rotate(22°) — near ankle
├─ torso-head                  origin at hip; neck and head stay attached to torso
└─ front-upper-arm             translate(24, -105), rotate(35°) — near shoulder
   └─ front-lower-arm           translate(0, 54), rotate(-104°) — near elbow
```

The tree is also the SVG painter's order: rear arm, rear leg, near leg, torso/shorts, near arm. Paper fills occlude rear contours. Round joint caps overlap at elbows/knees; keep parent-child translations fixed while animating rotations.

## Rive import / animation notes

Import as an editable SVG hierarchy using `upload_asset` then `assets_tool.addSvgInstance`. The IDs are deliberate labels. SVG origin transforms express the pivots, but inspect the imported hierarchy before keyframing: an importer can introduce wrapper nodes or recenter paths. Animate the labeled group origin, not an automatically centered bounding-box pivot. If necessary, place the imported group in a fresh node at the documented joint and offset its children while preserving the world pose.

Use a roughly 0.75–0.9 second full stride with the two sides 180 degrees out of phase. Knees must flex during recovery; ankles compensate for thigh/shin rotation; arms oppose the legs. Body vertical motion should remain about 3–5 SVG units. A small forward lean already lives in the drawing. The supplied pose is a flight phase. Avoid a constant simultaneous rotation of all limbs or stretching the entire figure. Ground contact should be checked at normal speed after authoring.

For static or reduced-motion presentation, the SVG itself is a clean still. The existing `runner-sketches.png` remains a separate visual fallback for the website.

## Verification

XML parsed successfully: 12 unique named groups and 33 vector paths. Rendered through the bundled Sharp SVG renderer at 720 × 840 and visually inspected; the complete head, hands and both shoes fit the artboard. No Rive import or animated playback is claimed by this asset-authoring step. A CairoSVG preview attempt could not load the host's Cairo dynamic library; the successful Sharp render was used for visual acceptance instead.
