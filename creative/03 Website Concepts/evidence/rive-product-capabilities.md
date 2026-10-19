> Live follow-up: Computer restored the native editor connection. A real articulated runner was built, rendered and exported in this account. See [executed results](rive-live-verification.md) and [live preview](../motion.html). Earlier connection/entitlement limitations below describe the initial audit, not the current result.

# Rive capability research for Running Hackathon

Checked against official Rive documentation on 16 October 2026. This is a product capability map, not proof that every feature is exposed by the connected MCP, enabled on this account, or supported by every runtime. Editor/MCP inspection belongs in the separate audit. Nothing was installed, purchased, published, or changed in the Rive editor during this research.

**Unresolved export entitlement conflict:** the official editor documentation says runtime export is available on paid plans, while the exposed Rive MCP `export_file` declaration explicitly says `.riv` export works on every plan. These are separate evidence sources and currently disagree. No export was attempted in this read-only investigation; do not infer that this account requires an upgrade, or that a free export has been verified. Exact wording and sources are recorded below.

## Recommendation for this website

Use normal HTML for the page, type, navigation, registration and content. Let a warm, real photograph establish the colour: terracotta track, morning sun, field greens, brick-orange shoes. Add a small transparent illustration layer only where motion improves the composition. Rive is strongest here for an authored runner with a convincing gait, a few hand-drawn details, and responsive interactions. It will not make a weak photograph, generic layout or mechanical drawing feel editorial by itself. This is a design/engineering judgment based on the documented capabilities below.

Three viable implementation approaches:

| Approach | Best fit here | Costs and limits | Choice |
| --- | --- | --- | --- |
| HTML/CSS + SVG illustrations | Simple hero reveals, breathing line drawings, arrows, flowers, route-line draw-on, understated hover details | Browser-native rendering; no separate Rive authoring/export process. Complex articulated runner motion becomes more manual to maintain. SVG is a scriptable, stylable vector format; CSS supports timed keyframe animation. | Start here for most decorative motion. |
| HTML/photo + a selective Rive canvas | A rigged runner, pose changes, interactive handwritten motif, coordinated multi-part animation, a reusable visual that responds to page data | Extra JavaScript/WASM and a `.riv` asset; requires runtime/device testing and an authoring/export plan. Higher initial craft effort, cleaner reuse once the character/interaction is authored. | Use for one signature piece if it earns its place. |
| HTML/photo + rendered loop or Lottie/dotLottie | Predetermined illustrative motion or an existing After Effects/Lottie production workflow; video for actual photographic movement | A rendered video has fixed pixels and a predetermined sequence. Lottie/dotLottie has its own renderer/feature compatibility; modern dotLottie also has state-machine features, so do not call it universally non-interactive. A playback asset alone is less useful than Rive when we need bone rigs and live scene data. | Choose if the motion is fixed and already made in that pipeline. |

Sources: [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), [CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animations/Using), [dotLottie web state machines](https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/state-machines), [Rive state machines](https://rive.app/docs/editor/state-machine/state-machine), [Rive runtimes](https://rive.app/docs/runtimes/getting-started).

## What the product can author

### Drawing, art direction and components

- Editable vector shapes and paths, procedural shapes, Bézier paths, pen drawing, vertex editing, groups and reusable components/artboards.
- Pencil, Brush and Eraser freehand tools. Brush supports variable width, stylus pressure/speed variation, configurable tips, smoothing and stabilization; Pencil keeps a consistent stroke. This is directly relevant to loose, human runner drawings.
- Multiple fills and strokes; solid, linear/radial gradients; fill rules, blend modes, caps/joins, dashed and trimmed strokes. Vector feathering softens vector edges, with renderer requirements.
- Reusable artboard components, including nested artwork and behavior; organized libraries are a plan-dependent collaboration capability.

Sources: [Shapes and paths](https://rive.app/docs/editor/fundamentals/shapes-and-paths-overview), [Freehand drawing](https://rive.app/docs/editor/design/freehand-drawing), [Fill and stroke](https://rive.app/docs/editor/fundamentals/fill-and-stroke), [Components](https://rive.app/docs/editor/fundamentals/components).

### Raster, vector, font and audio assets

- Import JPEG, PNG and WebP; layered Photoshop PSD; SVG converted into editable Rive vector content; TTF/OTF fonts; MP3/WAV/FLAC audio; custom blob assets for scripts.
- Lottie `.lottie` import is documented for Enterprise plans, rather than a generally available export format.
- Asset inclusion can be embedded, referenced for separate loading, or hosted on Rive servers where the plan allows. Replacing a source asset can update its uses. Raster compression is configurable.
- Fonts can use supported glyph subsets to control weight. Imported fonts and images still need their own appropriate usage rights; MCP access does not establish those rights.

Sources: [Assets](https://rive.app/docs/editor/fundamentals/assets-overview), [Fonts](https://rive.app/docs/editor/text/fonts).

### Typography and responsive layouts

- Native text runs/styles; wrapping, alignment, sizing and overflow (including ellipsis or fit-to-size), with dynamic runtime values through data binding. Text can be flattened to shapes, which sacrifices editable text and can add substantial geometry.
- Text modifiers support expressive animated typography; feature support also lists text following paths, fallback fonts and right-to-left layouts/text. Check the selected runtime before relying on newer text features.
- Responsive rows, columns, grids and stacks; nested containers; hug/fill behavior; padding, gap, alignment, absolute/relative positioning; components and lists can reflow and scroll. N-slicing helps more complex shapes scale appropriately.

Sources: [Text](https://rive.app/docs/editor/text/text-overview), [Text modifiers](https://rive.app/docs/editor/text/text-modifiers), [Layouts](https://rive.app/docs/editor/layouts/layouts-overview), [Feature support](https://rive.app/docs/feature-support).

### Timeline animation, organic deformation and rigging

- Keyframe animation in Animate mode, easing/interpolation, multiple timelines, and state-machine composition of animations.
- Trim paths can animate a stroke's start, end and offset: useful for a hand-drawn route, underline or illustration reveal.
- Bone hierarchies can transform rigid parts, deform weighted vector vertices/Bézier handles, or deform raster meshes. Different parts of one rig can use different methods, so an orange shoe can remain solid while a leg bends.
- Raster meshes are triangulated surfaces with editable contours; vertices can be keyed or bound to bones. The docs describe auto-tracing contours and auto-weighting as aids, not automatic good animation.
- Constraints can limit or copy transforms; IK is useful for planted feet/bending knees; distance, translation, rotation, scale and transform constraints connect motion. Follow-path and scroll constraints also appear in the official documentation navigation.

Sources: [Animate mode](https://rive.app/docs/editor/animate-mode/animate-mode-overview), [Trim path](https://rive.app/docs/editor/manipulating-shapes/trim-path), [Bones](https://rive.app/docs/editor/manipulating-shapes/bones), [Meshes](https://rive.app/docs/editor/manipulating-shapes/meshes), [Constraints](https://rive.app/docs/editor/constraints/constraints-overview), [Follow path](https://rive.app/docs/editor/constraints/follow-path-constraint), [Scroll constraint](https://rive.app/docs/editor/constraints/scroll-constraint).

### Live interaction and behavior

- State machines connect animations with states, transition logic and layers rather than requiring one linear sequence.
- Listeners can watch pointer enter/exit/move/down/up/drag, click/tap, view-model changes, Rive events, focus/blur, keyboard, gamepad, text input and semantic actions. Support for newer interactions varies by runtime.
- Listeners can update data or run actions; URL/audio events exist. Runtime applications can control state/data from their own code. Scroll position, page lifecycle and other browser values should be deliberately bridged into Rive rather than assumed to be automatic.
- Current docs prefer Data Binding for communication with application code and between artboards. Legacy runtime event-listening and direct text-run update APIs are deprecated in favor of properties/triggers and bound strings.

Sources: [State machines](https://rive.app/docs/editor/state-machine/state-machine), [Listeners](https://rive.app/docs/editor/state-machine/listeners), [Events](https://rive.app/docs/editor/events/overview), [Feature support / deprecations](https://rive.app/docs/feature-support).

### Data binding, lists and real application state

- View Models define a data contract; instances store values; bindings connect them to scene properties. Updates can flow to the scene and back to data, with listeners reacting to changes.
- Documented property types include number, string, boolean, colour, trigger, enum, image, font, blob, artboard, nested View Model and lists of instances.
- Artboard Lists generate dynamic repeated content; runtime APIs can add/remove items. Converters transform values before they drive presentation. Components can use independently bound instances.
- This can support an interactive route explorer, progress graphic, character reacting to registration steps or personalized badge. It does not supply a database, registration backend or ticketing system: application code supplies the data and side effects.

Sources: [Data binding overview](https://rive.app/docs/editor/data-binding/overview), [Property types](https://rive.app/docs/editor/data-binding/property-types), [Lists](https://rive.app/docs/editor/data-binding/lists).

### Luau scripting, testing and shaders

- Luau scripting extends authored scenes with procedural drawing/logic, custom layouts, converters, path effects, transition conditions, listener actions, reusable helpers and file-format import/export logic.
- Script inputs can participate in authoring and data workflows. Test scripts run unit tests for helper/pure logic inside the editor; this does not replace visual or browser acceptance testing.
- WGSL shaders run vertex/fragment programs on GPU Canvas. Uniforms and textures can drive procedural effects or process artboards rendered to textures. Exported `.riv` includes compiled target variants, not original WGSL source; required targets must be selected.
- Documented shader restrictions include no compute shaders, override declarations, 64-bit numbers, push constants, subgroups or non-uniform resource indexing.
- Web GPU Canvas is explicitly experimental and opt-in in `@rive-app/webgl2` 2.42.0+. It enables 3D/shader content, cannot use the shared offscreen-renderer pattern, and needs a separate WebGL context for each canvas. This is unnecessary complexity for a quiet runner sketch.

Sources: [Scripting](https://rive.app/docs/scripting/getting-started), [Protocols](https://rive.app/docs/scripting/protocols/overview), [Unit tests](https://rive.app/docs/scripting/debugging/unit-testing), [WGSL shaders](https://rive.app/docs/scripting/wgsl-shaders), [Web GPU Canvas](https://rive.app/docs/runtimes/web/gpu-canvas).

## Integration, delivery and real limitations

### Runtimes and renderer choices

Official runtimes cover Web JavaScript, React, Apple, Android, Flutter, React Native, C++ and game-engine paths including Unity and Unreal; documentation also covers other integrations. Runtime libraries are open source under MIT and allow commercial use. This license statement applies to runtime code, not a blanket license to third-party assets.

For web, use the current `@rive-app/webgl2` / React equivalent as the default when editor fidelity or feathering matters. Browser Canvas2D is an alternative worth measuring for content with blend modes. `canvas-lite` drops text, layouts, audio and scripting. Old `@rive-app/webgl` is deprecated. New editor features can be skipped on older runtimes even when the file itself loads, so successful loading is insufficient verification.

Sources: [Runtimes and MIT licensing](https://rive.app/docs/runtimes/getting-started), [Canvas vs WebGL2](https://rive.app/docs/runtimes/web/canvas-vs-webgl), [React runtime](https://rive.app/docs/runtimes/react/react), [Feature support](https://rive.app/docs/feature-support).

### Performance and accessibility

- The runtime has a real payload: Rive's January 2026 size table lists compressed WASM at 222 KB canvas-lite, 567 KB canvas, 648 KB webgl2, excluding the rest of an app and animation assets. Treat these as dated reference numbers and measure the installed release.
- Image dimensions, unnecessary glyphs, huge vertex counts, blend modes, clipping and simultaneously active animations all matter. A tiny `.riv` download does not guarantee low memory/GPU use. Test target mobile devices, stop unnecessary loops, and use static idle states where appropriate.
- Rive now supports authored semantics. Web runtime semantics build an accessibility DOM overlay from editor roles/labels/states/actions, but are opt-in, disabled by default and described as experimental. Missing editor semantics are not automatically repaired by enabling the runtime option.
- Reduced motion is not automatic. Application code must detect the preference, pass a bound property, and the authored scene must choose static/reduced paths or speeds. Keep website headings, copy and calls to action as normal HTML for this project; that is our implementation recommendation, not a claim that Rive has no accessibility support.

Sources: [Runtime sizes](https://rive.app/docs/runtimes/runtime-sizes), [Performance practices](https://rive.app/docs/getting-started/best-practices), [Editor semantics](https://rive.app/docs/editor/accessibility/semantics), [Web semantics](https://rive.app/docs/runtimes/web/semantics), [Reduced motion](https://rive.app/docs/editor/accessibility/reduced-motion).

### Exports, backups, hosting and plans

- `.riv` is the production runtime format. Editable archival backup is `.rev`, retaining information stripped for runtime. Keep both if authoring in Rive and the available export path permits them.
- Paid Cloud Renderer supports H.264, GIF, WebM, PNG/SVG stills and PNG/SVG sequences. These outputs lose the live behavior of the interactive runtime.
- Hosted/embed links are snapshots that need regeneration after edits. Iframe embeds do not expose runtime APIs; use direct runtime integration for programmatic hero behavior.
- The currently documented Free plan includes three collaborative files, state machines, data binding and scripting. The editor runtime-export page says, “Exporting for runtime is available on paid plans.” The exposed MCP `export_file` tool instead says, “A .riv export works on every plan”. Its declaration identifies `riv` with the editor's “Export > For Runtime” action, so there is no documented distinction that explains the disagreement. It also calls `.rev` backup an upgrade feature, consistent with the editor backup page's paid-plan requirement. Treat the `.riv` gate as unresolved until an authorized actual export or first-party clarification establishes which rule applies.
- Current pricing docs list Cadet at $17/seat/month or $108/year, Voyager at $39/month or $304/year; Voyager adds libraries, hosted assets and embed hosting. The MCP declaration may represent a different product release or export entitlement, but that is an inference, not a verified exception. Account entitlement and actual export success were not tested; this research does not establish a need to purchase anything.
- Rive can author substantial interactive interfaces, but this is an interactive graphics/UI pipeline. Do not treat a Rive canvas as the entire event-site architecture or as a photographic video-editing workflow.

Sources: [Runtime export](https://rive.app/docs/editor/exporting/exporting-for-runtime), [Backup export](https://rive.app/docs/editor/exporting/exporting-for-backup), [Video/images](https://rive.app/docs/editor/exporting/exporting-for-video-and-static-design), [Sharing/embedding](https://rive.app/docs/editor/embed-urls/overview), [Current plan documentation](https://rive.app/docs/account-admin/pricing).

## A restrained Running Hackathon application

Recommended concept: warm filmic photograph, clear short type, ink-black loose runner illustration set into the edge of the composition, with the shoes picking up the photograph's brick orange. A short draw-on then a settled pose is enough for a landing hero. If the runner genuinely needs ongoing gait, rig it with bones and carefully authored contact positions, use subtle line variation, and let it become still on reduced-motion preference. Keep colours in real imagery; avoid a full-screen Rive colour block, excessive parallax, constant wobble or conspicuous shader effects.

Possible Rive contract for later implementation: `motionAllowed` boolean; `scrollProgress` number supplied by page code only if useful; `pointerX`/`pointerY` clamped numbers only for a minimal response; `isHeroVisible` boolean to pause/settle; and one trigger for a deliberate interaction. These are proposed project fields, not built-in Rive globals.

Acceptance before calling it ready: whole animation at normal speed; actual runner foot contact and leg crossings; visual comparison beside reference; desktop/mobile crop and scaling; low-end mobile performance; reduced motion; keyboard/screen reader behavior for any actual controls; correct `.riv`/WASM delivery and static fallback on load failure. No website or animation has been built or visually accepted by this research brief.
