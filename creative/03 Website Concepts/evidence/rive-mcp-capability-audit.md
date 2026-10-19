> Live follow-up: Computer restored the native editor connection. A real articulated runner was built, rendered and exported in this account. See [executed results](rive-live-verification.md) and [live preview](../motion.html). Earlier connection/entitlement limitations below describe the initial audit, not the current result.

# Rive MCP capability audit

Date: 16 October 2026 (Europe/London).
Scope: every Rive tool exposed in this session, inspected read-only. There are 40 exposed tools. This document describes the callable interface available to Codex; it is not a claim that the MCP exposes every feature of the Rive product.

## Evidence and verification status

- Latest primary-agent recheck: session_info failed because the local MCP transport endpoint at 127.0.0.1:9791 was unreachable. A local listener check found no process listening, and an HTTP connection check also failed. Earlier successful reads below are historical observations within this run; the connection is not verified healthy at delivery. No settings or editor state were changed to repair it.

- Verified live: session_info returned success with activeFileId:null, activeRevisionId:null, activeFileName:null, and openTabs:[].
- Verified live limitation: get_scripting_reference(topic:"rules") returned "Error: No file is currently open in the editor."
- All other capabilities below are declared by the supplied tool metadata and schemas. They were not exercised against an editor document in this audit.
- No Rive editor changes, imports, exports, selection changes, scripts, state machines, or playback were made.
- The exact metadata/signatures for all 40 exposed tools are preserved at the end of this file.

## Practical conclusion for Running Hackathon

The available MCP is broad enough, in principle, to author custom vector illustration, animate transforms and paths, create pointer interactions/state machines, data-bind properties, capture an artboard, and export a runtime .riv asset. It is a plausible tool for one restrained organic accent on the website: a hand-drawn runner, a line that draws a route, grass/sun movement, or an orange shoe detail.

It does not supply photography, film grading, authentic runner footage, or the overall art direction. The warm photographic hero should still be built from photographic imagery. Rive can be a transparent illustrated layer or a small interaction, while real HTML carries the readable, accessible page copy and controls.

This is a design recommendation, not an executed build. For these concepts, the least complex approach is a real-photo hero plus an authored SVG/CSS illustration first; Rive is justified when the runner needs coordinated limb motion or a proper interaction/state system.

## Three approaches compared

| Approach | Best fit | Quality and integration tradeoff | Main failure modes |
|---|---|---|---|
| SVG + CSS/JavaScript | A line-drawn runner, route reveal, tiny hover detail | Fast local iteration; easy DOM integration; no Rive editor prerequisite | Complex character motion becomes harder to author and maintain; can look mechanical if simple joints are overused |
| Rive vector animation + state machine | A reusable hand-drawn runner loop, idle/run response, small transparent interactive illustration | Good declared authoring/runtime model; scalable illustration; data-driven behavior; .riv export | Editor must have a file open; current MCP has new-bone creation gap; visual quality requires real playback QA; feature/runtime support must be checked |
| Video/image sequence over photography | Authentic running action, sun/track textures, analog camera movement | Strongest photographic realism; easiest route to the desired film mood when source footage is good | File size, playback/autoplay/accessibility, licensing, crop quality, and lack of fine interactivity |

From scratch, I would retain the image-led hero and use Rive only as a small secondary illustration, after the static concept is accepted. Avoid making Rive responsible for the whole page or using motion to compensate for weak imagery.

## Capability map

### 1. Session, file context, artboards, undo

Tools: session_info, open_file_editor, list_artboards.

- Session inspection reports the open cloud files/tabs and active file.
- The artboard manager can identify the current file, list artboards, read the selected artboard, focus an artboard, rename/move/resize artboards, create artboards, close Revision History, and undo the last change.
- Artboards can be created with name, width, height, component eligibility, and optional exact canvas position. The documented preference is to omit x/y so the editor places them in free space.
- list_artboards reports id/name/isActive and selectionArtboardId. The selected artboard is a better indication of current work than the sticky isActive flag.

Important boundary: despite the name open_file_editor, it has no command for opening a cloud file, creating an empty document, switching file tabs, listing projects, or navigating the Rive home screen. An editor document must be opened through the UI or another capability. upload_rev can create a new file inside the current open file's project, but still requires that project context.

### 2. Object discovery, structure, inspector properties

Tools: get_selection, find_objects, get_artboard_hierarchy, query_objects, query_property_keys, query_property_values, set_property_values.

- Inspect selected objects and the artboard object tree.
- Find objects by case-insensitive name substring and/or type, optionally under one parent.
- Query objects by IDs with bounded child depth; default to selection if IDs are omitted.
- Discover available inspector properties, integer keys, animatable/data-bindable flags, and enum values.
- Read and write properties with per-property error reporting (unknown ID, read-only, type mismatch, invalid enum, etc.).
- Opacity, scale, trim and constraint strength use editor-style percent units; rotation uses degrees.
- Discovery should precede property writes. Integer keys and enum indices should be read from the current object rather than guessed.

The generic property setter may allow changes to existing features that have no dedicated creation tool. It does not itself provide a universal object-creation operation, so it is not evidence that every Rive object type can be authored from scratch through MCP.

### 3. Object management and grouping

Tools: group_editor, duplicate_objects, delete_objects, rename_objects, reorder_objects, reparent_objects, select_objects.

- Create an empty Node group or wrap objects while preserving screen positions and draw order.
- Duplicate sibling objects; rename by ID.
- Reorder front/back or one step forward/backward.
- Reparent into valid containers, with start/end insertion and per-operation rejection of invalid parenting.
- Select objects, clear selection, and delete objects.
- Required-field checks can reject an entire malformed rename/reorder/delete request before mutation.

Object IDs should be used for repeatability. Names can be ambiguous, and general deletion is destructive. The exact breadth of delete_objects across non-canvas entities was not tested.

### 4. Vector drawing, fills, gradients, line reveal

Tool: path_editor.

Commands:
- createParametricShapes
- createShapes
- addVertices
- addPaths
- addPaints
- setPaints
- addGradientStops
- removeGradientStops
- addTrimPaths
- combineShapes

Declared functionality:
- Native parametric rectangle (including corner radius), ellipse, triangle, polygon and star.
- Freeform vectors using moveTo, lineTo, cubicTo and close commands.
- Add paths and vertices to existing shapes.
- Fill/stroke paints; solid, linear-gradient or radial-gradient paint.
- Gradient stops and direct property tuning for gradient positions.
- Trim effects with start/end/offset percentages; sequential or synchronized trimming. This can create a hand-drawn route/runner reveal when keyframed.
- Boolean merge, extract region or erase region (Shape Builder).

Constraints:
- Every freeform shape needs paths and actual commands; filled paths must close.
- x/y are parent-local for shapes and shape-local for path commands. Layout origins are top-left, so geometric centering needs care.
- Boolean operations flatten consumed sources and may remove shapes. External dependents are blocked; animation key loss needs explicit confirmKeyLoss:true.
- Existing paint/trim/gradient properties should be retuned, not duplicated.

For hand-drawn Running Hackathon art, freeform Bezier strokes plus restrained fills are the relevant route. Simple geometric primitives alone are unlikely to produce the requested organic aesthetic.

### 5. Layout and text

Tool: layout_editor.

Commands: createLayout, appendLayout, setLayoutVisibility.

- Flexbox-style layouts with row/column arrangement, wrapping, padding, gaps and alignment.
- Text children participate directly in layout, with fixed/fill/hug sizing.
- Nested layout trees can structure buttons, cards, modals, navigation, lists and page-like UI.
- Grid and stack layout types are documented, but are host-feature-dependent and may be refused.
- Layout transforms/pivots are documented, as is visibility equivalent to display:none.
- Text can be created as part of the layout tree; fonts can be uploaded separately.
- To give text a background and padding, wrap it in a child layout. Tool instructions exclude emoji characters.

Caution: Rive layout supports responsive illustration/UI composition inside an artboard. It is not an automatic conversion into semantic HTML, and this schema does not establish SEO, keyboard, screen-reader, selection or DOM form behavior. Keep website content and navigation in the web page unless there is a concrete reason to use a canvas UI.

### 6. Components and repeated content

Tools: open_file_editor.createArtboard, component_editor.

Commands: addComponents, addComponentList.

- Mark artboards as components and instantiate them inside another artboard.
- Place by parent, x/y, and fixed/fill/hug sizing.
- node mode stretches; leaf scales proportionally; layout resizes/reflows internal content.
- A component list creates instances at runtime from a ViewModelPropertyList. It should not be manually populated with component children.
- Child components can receive a parent view model context or their own view model placement binding.

Boundary: the available component_editor exposes component placement and lists. It does not expose a generic "create component of arbitrary Rive type" command or bone creation.

### 7. Timelines and keyframes

Tool: animation_editor.

Commands: createLinearAnimations, listLinearAnimations, renameAnimations, modifyKeyFrames, queryKeyFrames, reverseKeyFrames.

- Create/list/rename linear animations.
- Add, delete and change keyframes by animation ID.
- Query all/selected keys and reverse them.
- Declared interpolation options include hold, linear, cubic and elastic. The earlier keyframe's interpolator drives the segment between two keys.
- Keyframe editor properties use the UI units, including percentages and degrees.
- Event trigger properties can have trigger keyframes for audio/report events.

Workflow requirement from tool metadata: a new artboard already has Timeline and a default state machine connected to it. Reuse/rename the pristine default timeline for the first animation. Avoid leaving redundant empty defaults. Additional timelines or state machines should only be created when the task actually needs additional animations/machines.

Boundary: some timeline input payloads are typed unknown; exhaustive inner fields such as every loop/work-area option are not declared by the exposed JSON schema and require live inspection or further documentation. No general set-current-frame/play/pause/scrub command is exposed.

### 8. State machines, conditions and behavior verification

Tool: animation_editor.

Commands:
- createStateMachine
- listStateMachines
- queryStateMachine
- queryStateMachineLayer
- createStateMachineLayers
- createStates
- updateStates
- createTransitions
- createConditions
- updateConditions
- deleteConditions
- simulateStateMachine

- Create/query layers, states and transitions; create/update/delete transition conditions.
- queryStateMachine fully expands states, transitions, conditions, events, listener actions, top-level inputs and listeners with resolved references.
- Special Entry and Any state names are documented.
- Add states to an existing layer with createStates rather than accidentally creating extra layers.
- simulateStateMachine runs headlessly with optional fps, frame count, selected machine and scheduled view-model inputs.
- Simulation returns console trace information: entered states, transitions, events and resting state per layer.
- Compare driven and undriven runs: the default layer already takes an unconditional transition.

Verification caveats:
- Simulation reverts values it writes, but executes real listener actions, including scripts. It is not strictly side-effect-free.
- It refuses to run when a timeline or state machine is open for editing.
- Simulation renders no pixels. Passing behavior traces cannot establish smooth motion, good foot contact, attractive paths, or perceptual quality.
- No live simulation was run in this audit.

### 9. Pointer, event and view-model listeners

Tool: create_listeners.

Pointer inputs:
- enter, exit, down, up, move, click, drag, dragStart, dragEnd
- primary/secondary/middle button selection on the compatible input types

Other input sources:
- Rive events
- ViewModel properties (including a relative flag)

Actions:
- viewModelChange: constant value or another property's live value; trigger properties signal runtime code
- alignTarget: optional preserved offset
- fireEvent: event by ID/name (documented legacy runtime signaling route; audio/open URL)
- scripted: attach a script asset

Every listener needs a target; untargeted listeners do not export at runtime. Whole-artboard pointer input needs a covering background shape, because the artboard itself is not a pointer target. The artboard can be a target for event or ViewModel inputs.

For hover-driven runner motion: bind a boolean ViewModel property, use enter/exit listeners to set it true/false, and use transition conditions. This is a declared workflow, not yet tested.

### 10. Data binding, ViewModels, converters, enums

Tool: viewmodel_editor.

Commands:
- listViewModels
- createViewModels
- createViewModelInstances
- addProperties
- databind
- modifyDataBind
- bindViewModelToArtboard
- bindViewModelToComponent
- listViewModelInstances
- listDataBinds
- createConverters
- listConverters
- listDataEnums
- createDataEnums
- addDataEnumValues
- removeDataEnumValues
- deleteDataEnums

- Define models/properties and concrete instances.
- Reference nested ViewModels by ID/name and resolve nested paths or relative bindings.
- Bind object properties to model data and assign an artboard's instance.
- Configure per-component context, inheritance or a specified instance; stateful components auto-manage instances and do not support that placement override.
- Change data-bind direction (toTarget/toSource plus twoWay flag), once, ordering, converter, path and relative flag.
- Bind strings to a Text Run rather than the Text object.
- Retargeting an existing property binding updates it rather than adding another.
- Create/reuse converters, including number-to-string, chained groups and arithmetic formula conversion.
- Create/manage enum values and enum-backed properties. Force is required to delete an enum still backing properties.

Limits:
- Converter deletion is not exposed by this tool; a mistakenly created converter can remain for manual removal. Reuse existing converters.
- Many nested creation payloads are typed unknown. The broad capability is declared, but precise supported property/list types should be confirmed before building a substantial application model.
- Models/bindings are not a backend, database, auth system or persistence service.

### 11. Custom property groups

Tool: property_group_editor.

Commands: addPropertyGroups, addPropertiesToGroup.

- Add typed number, boolean, color, string, enum or trigger custom properties to container components.
- Returned property ID/bindKey/keyframeKey allow animation and data binding.
- Enum properties need a DataEnum ID.

Important distinction: custom properties are not the source for listener/transition interactivity. Those use ViewModel properties. Do not build the wrong property system for hover or application state.

### 12. Assets, SVG, raster images, fonts and audio

Tools: upload_asset, assets_tool.

Commands in assets_tool: listAssets, queryAsset, addImageInstance, addImagesAsSolo, addSvgInstance.

- Upload one png/jpeg/webp image, SVG, ttf/otf font, or mp3/wav/flac audio asset.
- Data URIs are preferred; localhost accepts absolute paths/file URLs.
- Upload returns asset ID/metadata. It does not put the artwork on stage.
- Instantiate a raster image or editable SVG hierarchy separately.
- Create an image Solo with an active image but no ViewModel/input wiring.
- Assets can be queried as a folder tree and filtered by type.
- The asset tree can report scripts, libraries, components, blobs, SVG and Lottie as well as images/audio/fonts.

Limits:
- Listing an asset type is not proof that the upload tool can import it. Its declared new-file uploads do not include arbitrary Lottie JSON or .riv.
- There is no image search/generation/editing/film-grading endpoint.
- Audio MIME/name handling matters: filename or data URI name must have the supported audio extension.
- The upload tool's prescribed local-permission fallback supplies a curl recipe; the instructions say not to invent base64 payloads.
- Audio behavior, playback policies, runtime support, file size and licensing still need validation for a real website.

### 13. Mesh deformation and skinning

Tool: mesh_rigging_tool.

Commands: generateMesh, bindBones, autoWeight, querySkin.

- Generate a deformable mesh from an image, optionally traced to its silhouette.
- Configure trace detail (0..1), subdivision (0..4) and trace toggle.
- Bind bones directly to vector paths, or to generated raster meshes.
- Binding for the first time auto-weights; rerun autoWeight when bone/settings changes need it.
- Auto weighting supports blend (0..1), smoothing, and 1..4 influences (runtime maximum).
- Query bone bindings and optionally per-vertex weights.
- Overlapping pieces using the same bones should be weighted together so joint overlaps deform consistently.
- Component meshing is feature-flag dependent and only available for components in node mode.

Critical authoring gap:
- The mesh tool explicitly cannot create bones.
- Its instructions refer to using a "component tool" for bones, but the actually exposed component_editor only has addComponents/addComponentList. No exposed tool declares bone creation.
- Therefore a fully new skeletal rig is not confirmed possible through this MCP alone. Existing/imported bones can be bound; manual editor work or a valid imported .rev/template may supply them.
- Manual per-vertex weight painting is explicitly not exposed.
- No dedicated IK/constraint authoring tool is exposed. Some existing constraint properties may be discoverable/editable through generic properties, but this was not tested.

For a small stylized runner, transform-animated vector groups can avoid the skeletal gap. A natural multi-joint running cycle still requires close perceptual QA.

### 14. Scripting, shaders and diagnostics

Tools: get_scripting_reference, get_scripts, manage_scripts, text_editor, grep, script_diagnostics, recompile_all_scripts, read_console, run_tests.

- Discover editable code files and their language/protocol.
- Create/rename/move/delete Luau scripts and WGSL shader files using manage_scripts.
- Seed new files with content; missing folders can be created as part of create/move.
- Edit existing script/shader source with text_editor view/str_replace/insert.
- Search editable non-built-in code with case/whole-word/regex options.
- Read reference definitions/examples; documentation says to read "rules" before writing and "viewmodel_definitions" for model data.
- Analyze lint/type diagnostics, compile scripts, inspect console print/error output, and run a named Tests script.
- WGSL shaders are documented for use with the GPU canvas.
- get_scripts can report luau, animascript or wgsl; manage_scripts creation exposes luau/wgsl only.

Limits:
- The reference lookup currently requires an open file and was unavailable during the live check.
- Creating a shader source file does not prove the MCP can attach/configure every shader effect in the scene; no dedicated shader-attachment command is declared.
- read_console reads executions that already happened; it does not itself trigger behavior.
- Test success, script syntax support and renderer/runtime parity require actual document/runtime tests.
- The exposed schemas do not promise arbitrary browser JavaScript, network requests, DOM access, a full web application framework or every Rive script protocol. Those should not be assumed.

### 15. Preview, rendering and verification

Tools: capture_artboard, simulateStateMachine, script_diagnostics, read_console, run_tests, query_property_values.

- Static artboard capture to PNG; optional background; transparent by default.
- Default long edge 512 pixels, clamped 64..1536.
- Static capture is suitable for composition, color, alignment and fine-detail checks at the appropriate size.
- Headless state traces verify behavior, while script diagnostics/tests verify code behavior.

Missing from this exposed surface:
- No MP4/GIF export.
- No direct frame-number/time argument to capture_artboard.
- No general timeline scrubbing/play/pause or exported-runtime screenshot command.
- No full animated-video or reference side-by-side perceptual QA endpoint.
- No browser embedding/performance/accessibility testing endpoint within Rive MCP.

A completed animation should still be exported into the local website and reviewed in real time at desktop and mobile sizes. Inspect the complete loop, transitions, limb timing, foot contact, crop and reduced-motion behavior; static capture and machine traces are insufficient.

### 16. Export, backup and document import

Tools: export_file, upload_rev.

- Export the currently open in-memory state, including unsaved edits.
- .riv: runtime asset for applications; tool metadata says this is available on every plan.
- .rev: full editable native backup; upgrade-gated and may be refused.
- .rev can embed referenced assets (default), requiring network downloads.
- .riv may also need network access to resolve hosted asset CDN IDs.
- Destination must be an existing absolute local directory; existing filenames are never overwritten.
- inline_base64 exists only as a prescribed retry after a permission-denied write, not a speculative default.
- Import a .rev into an empty open file, or upload it as a new file in the current open file's project.
- A .rev import into nonempty content is refused.

Limits:
- No generic .riv import declared.
- No blank cloud-file/project creation or home navigation declared.
- No hosted publication, runtime installation or website deployment endpoint.
- Cloud .riv export is not proof the file is saved as an editable cloud revision or that all intended external runtimes support every feature. Verify those separately.
- A backup being upgrade-gated does not authorize upgrading/purchasing.

### 17. Organization and tags

Tool: tag_editor.

Commands: queryTags, createTags, updateTags, deleteTags, assignTags, unassignTags.

- Color, hidden/locked state, counts and optional per-tag object lists.
- Tag components, animations, assets and model properties.
- Write commands require a plan that supports tags.
- Tags organize the editor only; they do not export into .riv and have no runtime behavior.

## Schema inconsistencies and uncertain areas

1. Some descriptions mention query_core_object_tool setPropertyValues/queryObjects. That tool name is not exposed; actual calls are query_objects, query_property_keys, query_property_values and set_property_values.
2. text_editor says to create scripts with create_script. The exposed script lifecycle tool is manage_scripts with command:create; create_script is not exposed.
3. mesh_rigging_tool says to create bones with a component tool, but component_editor exposes only component instances/lists.
4. Many multiplexed inner payloads use TypeScript unknown, so the metadata is not an exhaustive schema for every layout, animation, converter or ViewModel field. A future build should inspect references and query existing structures instead of guessing.
5. Grid, stack, component meshing, tags, backup export and shader/runtime behavior have host/plan/feature constraints. Their presence in metadata is not a successful availability test.
6. No active document means this audit establishes available endpoints and live connection state, not an end-to-end authored artifact.

## Suggested bounded first Rive build

Once a document is open:
1. Inspect session/file/artboards; create one isolated 600x300 component artboard if appropriate.
2. Import or author a small custom SVG runner using slightly irregular dark strokes and one brick-orange shoe detail.
3. Reuse the default Timeline for a short restrained idle/run loop; keep line weight/character consistent.
4. Add one ViewModel-driven response only if it improves the concept, such as a slight change in stride on hover.
5. Capture the artboard and inspect the artwork.
6. Simulate any state machine and compare driven/undriven transitions.
7. Export .riv to a new local output filename, embed it in the localhost concept using an appropriate Rive runtime, and inspect the complete animation at normal speed.
8. Check mobile sizing, load cost, visual crop, keyboard/fallback implications and reduced motion. Keep core content usable independently of the animation.

No work in that proposed sequence was executed as part of this read-only audit.

## Complete exposed tool inventory and exact schemas

The sections below reproduce the metadata exposed to this session. They are the source for the declared-capability claims above, and preserve all currently exposed commands and argument fields.

### mcp__rive__animation_editor

Creates and modifies animations (state machines, linear animations, keyframes) on the active artboard. Falls back to the first artboard when none is activated; use query_core_object_tool.listArtboards to disambiguate.
REUSE THE DEFAULTS - a new artboard already has one timeline named "Timeline" and one default state machine (isDefault=true) whose Entry is already connected to that timeline. To animate the artboard:
  1. renameAnimations to rename the "Timeline" to something meaningful (e.g. "Bounce").
  2. modifyKeyFrames to add keyframes to that same timeline.
This applies when creating SEVERAL animations too: if the default timeline is still pristine (default name, no keyframes), rename it to the FIRST of them, then use createLinearAnimations only for the remaining ones - never leave a stale "Timeline"/"Timeline 1" behind next to your named animations. If the user has already renamed or keyed it, leave it alone and create all animations fresh.
Do NOT call createLinearAnimations or createStateMachine for this - a second timeline or state machine is almost always wrong. Only create new ones when the user explicitly asks for an additional animation or state machine.
Special state names: "{Entry State}", "{Any State}". Between two keyframes the smaller-frame keyframe's interpolator (hold/linear/cubic/elastic) drives the curve. Commands: createStateMachine, createStateMachineLayers, createTransitions, createConditions, createLinearAnimations: create the named entity; createStates: Add new animation states to an EXISTING layer (use this when the layer already exists; createStateMachineLayers spawns a new layer instead); Listeners are created with the create_listeners tool (not here); this tool reads them via queryStateMachine and drives their state changes via createConditions; updateConditions: change an existing condition's operation, compared value, or viewmodel property (ids from queryStateMachine); deleteConditions: remove conditions by id; listStateMachines: id/name/layers only — for inspection use queryStateMachine; listLinearAnimations: all linear animations; queryStateMachine: PRIMARY read. Fully expands a state machine — layers with states/transitions/conditions/events/listenerActions, plus top-level inputs and listeners. View-model, event, and input refs are pre-resolved with names. Defaults to the only state machine; pass stateMachineId to disambiguate; queryStateMachineLayer: Re-read one layer (same per-layer payload); updateStates: Update existing states; renameAnimations: Rename animations; modifyKeyFrames: Add/delete/change keyframes. Double values use the units the editor UI shows: opacity/trim/strength as 0-100 percentages, rotation in degrees. Event keys (play audio / report event) key the event's trigger property and come back as type "trigger"; their value is ignored; queryKeyFrames: Read keyframes; simulateStateMachine: VERIFY a machine actually runs. Plays it headlessly and returns the same console trace the editor panel shows (frames, states entered, transitions taken, events fired), plus the resting state per layer. Drive it with inputs [{frame, property, value}] on viewmodel properties. Use after wiring conditions/listeners to confirm the machine leaves Entry and reaches the state you expect; an empty trace means nothing fired. Reverts the values it writes, so the document is unchanged, but it does run listener actions (including scripts) as real playback would; it does not render pixels. transitionsObserved counts the transitions taken (the default layer takes one unconditionally, so compare a driven run against an undriven one). Refuses to run while a timeline or state machine is open for editing. reverseKeyFrames: Reverse keyframes (scope: selection, else visible graph curves, else all). Data is passed under data.<command> or directly in data.

exec tool declaration:
```ts
declare const tools: { mcp__rive__animation_editor(args: { command: "createStateMachine" | "createLinearAnimations" | "listStateMachines" | "listLinearAnimations" | "queryStateMachine" | "queryStateMachineLayer" | "createStateMachineLayers" | "createStates" | "updateStates" | "createTransitions" | "createConditions" | "updateConditions" | "deleteConditions" | "renameAnimations" | "modifyKeyFrames" | "queryKeyFrames" | "reverseKeyFrames" | "simulateStateMachine"; data?: { createConditions?: { transitions: unknown; }; createLinearAnimations?: { linearAnimations: unknown; }; createStateMachine?: { layers?: unknown; linearAnimations?: unknown; name: string; }; createStateMachineLayers?: { layers: unknown; stateMachineId: string; }; createStates?: { layerId: string; states: unknown; }; createTransitions?: { states: unknown; }; deleteConditions?: { conditionIds: unknown; }; listLinearAnimations?: { [key: string]: unknown; }; listStateMachines?: { [key: string]: unknown; }; modifyKeyFrames?: { add?: unknown; animationId: string; change?: unknown; delete?: unknown; }; queryKeyFrames?: { animationIds?: unknown; selectedKeyFramesOnly?: boolean; }; queryStateMachine?: { stateMachineId?: string; }; queryStateMachineLayer?: { layerId: string; }; renameAnimations?: { animations: unknown; }; reverseKeyFrames?: { animationId?: string; }; simulateStateMachine?: { fps?: number; frames?: number; inputs?: unknown; stateMachineId?: string; }; updateConditions?: { conditions: unknown; }; updateStates?: { states: unknown; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__assets_tool

Read and instantiate assets (images, audio, fonts, scripts, libraries, components, blobs, svg, lottie). listAssets: Folder-grouped tree; queryAsset: One asset by id; addImageInstance: Spawn an Image shape from an ImageAsset; addImagesAsSolo: Spawn a Solo of Images (no input/VM wiring); addSvgInstance: Import an SVGAsset as an editable shape hierarchy under a Node.

exec tool declaration:
```ts
declare const tools: { mcp__rive__assets_tool(args: { command: "listAssets" | "queryAsset" | "addImageInstance" | "addImagesAsSolo" | "addSvgInstance"; data?: { addImageInstance?: {
  assetId: string;
  name?: string;
  // Optional. Defaults to active artboard.
  parentId?: string;
  x?: number;
  y?: number;
}; addImagesAsSolo?: {
  // Optional. Defaults to first.
  activeAssetId?: string;
  // ImageAsset IDs in display order.
  assetIds: Array<string>;
  name?: string;
  // Optional. Defaults to active artboard.
  parentId?: string;
  x?: number;
  y?: number;
}; addSvgInstance?: {
  // SVGAsset id from listAssets.
  assetId: string;
  name?: string;
  // Optional. Defaults to active artboard.
  parentId?: string;
  x?: number;
  y?: number;
}; listAssets?: {
  // Optional. One of: image, audio, font, script, library, component, svg, lottie, file, folder, group, componentGroup. Folders are still walked.
  typeFilter?: string;
}; queryAsset?: { assetId: string; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__capture_artboard

Render an artboard to a PNG image so the model can examine what was actually produced, rather than inferring it from the object tree.

exec tool declaration:
```ts
declare const tools: { mcp__rive__capture_artboard(args: {
  // Its id (as returned by `list_artboards`) or its exact name. When omitted, uses the artboard the editor is currently showing.
  artboardId?: string;
  // Hex color: `#aarrggbb`, `#rrggbb`, or `0x…`. When omitted, the background is fully transparent, and transparent pixels mean "nothing was drawn there" — not black or white.
  backgroundColor?: string;
  // Pixel length of the image's longer edge; the shorter edge follows the artboard's aspect ratio. Defaults to 512, clamped to 64–1536. The default size is sufficient for checking layout, composition, alignment, and color; request a larger size only when you need to read text or inspect fine detail, as cost scales with image area.
  longEdge?: number;
}): Promise<CallToolResult>; };
```

### mcp__rive__component_editor

Adds Components to other Artboards. When a Component Artboard has a ViewModel bound, we should try to hook it up to the parent Artboard's ViewModel as a property. Supports commands like,addComponents: Adds a Component as a child of the given parent on the specified artboard; addComponentList: Adds a Component list container as a child of the given parent on the specified artboard where the parent determines the list's layout. A Component List automatically generates component instances at runtime based on the specified ViewModelPropertyList id so DO NOT manually add Components as children of the list. Use instead of 'addComponents' whenever a list of items is required; 

exec tool declaration:
```ts
declare const tools: { mcp__rive__component_editor(args: { command: "addComponents" | "addComponentList"; data?: { addComponentList?: {
  // The ID of the artboard target
  artboardId?: string;
  // The name of the artboard target
  artboardName?: string;
  // The ID of the object that should be the Components immediate parent
  parentId?: string;
  // The ID of the ViewModelPropertyList to populate the Component list
  viewModelPropertyListId?: string;
}; addComponents?: Array<{
  // The ID of the artboard target
  artboardId?: string;
  // The name of the artboard target
  artboardName?: string;
  // The ID of the component to add to the artboard
  componentId?: string;
  // The height scale type of the component when in layout mode. fixed = fixed size, fill = fills its parent layout, hug = lets its children determine its size
  heightScaleType?: "fixed" | "fill" | "hug";
  // The mode of the component to add which determines how it behaves when it resizes. node = stretches, leaf = scales with proportions, alignment, layout = does not scale, but resizes and reflows its internal layout contents
  mode?: "node" | "leaf" | "layout";
  // The ID of the object that should be the Components immediate parent
  parentId?: string;
  // The width scale type of the component when in layout mode. fixed = fixed size, fill = fills its parent layout, hug = lets its children determine its size
  widthScaleType?: "fixed" | "fill" | "hug";
  // The X position of the component in the artboard
  x?: number;
  // The Y position of the component in the artboard
  y?: number;
}>; }; }): Promise<CallToolResult>; };
```

### mcp__rive__create_listeners

Creates state machine listeners for interactivity (hover, click, drag). Every listener requires a target component (targetId or targetName) - untargeted listeners are not exported at runtime. For artboard-wide pointer input, add a background shape covering the artboard and target that (pointer inputs are not offered on artboard targets); the artboard itself is targetable by its own name for event/viewModel inputs. Listener inputs react to pointer, event, or view-model signals and run actions: viewModelChange (set a bound property, optionally to a constant value; on a trigger property this fires the trigger - the preferred way to signal runtime code), alignTarget, fireEvent (Rive Events are legacy for runtime signaling - audio/open-URL only), scripted. For hover/press driven state changes: add a boolean viewmodel property, create enter+exit (or down+up) listeners that viewModelChange it true/false, then animation_editor createConditions on the transitions against it. Use animation_editor queryStateMachine to inspect existing listeners. Defaults to the only state machine when stateMachineId is omitted.

exec tool declaration:
```ts
declare const tools: { mcp__rive__create_listeners(args: {
  listeners: Array<{
  actions?: Array<{
  eventId?: string;
  eventName?: string;
  preserveOffset?: boolean;
  scriptAssetId?: string;
  // Write another viewmodel property's live value instead of a constant (the inspector's Property value mode). Use to record which list item was hit: source a list index property into a number property.
  sourceViewModelPropertyId?: string;
  targetId?: string;
  targetName?: string;
  type: "fireEvent" | "viewModelChange" | "alignTarget" | "scripted";
  value?: unknown;
  viewModelPropertyId?: string;
}>;
  // When omitted, defaults to a single "enter" input (the editor default).
  listenerTypes?: Array<"enter" | "exit" | "down" | "up" | "move" | "click" | "drag" | {
  // Mouse button a down/up/click/drag input responds to. Defaults to primary; rejected for other pointer types.
  button?: "primary" | "secondary" | "middle";
  type: "enter" | "exit" | "down" | "up" | "move" | "click" | "drag" | "dragStart" | "dragEnd";
} | { eventId?: string; eventName?: string; type: "event"; } | { isRelative?: boolean; type: "viewModel"; viewModelPropertyId: string; }>;
  // Optional display name. Defaults to the target component name.
  name?: string;
  targetId?: string;
  // Component to listen on, by name (shape, layout, text run, or the artboard itself). One of targetId / targetName is required.
  targetName?: string;
}>;
  // Optional. Defaults to the only state machine on the active artboard. References resolve against the machine's own artboard.
  stateMachineId?: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__delete_objects

Permanently delete objects from the file by their IDs. An entry that is not a string fails the whole call before anything is deleted; an id that matches no object is reported in errors.

exec tool declaration:
```ts
declare const tools: { mcp__rive__delete_objects(args: {
  // Array of object IDs to delete.
  objectIds: Array<string>;
}): Promise<CallToolResult>; };
```

### mcp__rive__duplicate_objects

Duplicate objects by their IDs. Copies are placed as siblings of the originals.

exec tool declaration:
```ts
declare const tools: { mcp__rive__duplicate_objects(args: {
  // Array of object IDs to duplicate. Copies are placed as siblings of the originals.
  objectIds: Array<string>;
}): Promise<CallToolResult>; };
```

### mcp__rive__export_file

Exports the currently open document to disk. `format` chooses between the runtime format (.riv, for embedding in an app) and the native backup format (.rev, a full editable revision). The export snapshots the in-memory document AS IT CURRENTLY IS, including any unsaved changes. The file is written into `destination` and the result reports the full path written; an existing file at that path is never overwritten. Either format may need network access to complete: a .rev export needs it when embed_assets is on, and a .riv export needs it whenever the document references hosted assets, since their CDN ids are resolved during export. A .riv export works on every plan; a .rev backup is an upgrade feature and may be refused, in which case .riv is a genuine alternative rather than a workaround.

exec tool declaration:
```ts
declare const tools: { mcp__rive__export_file(args: {
  // Absolute path of an EXISTING directory on this machine to write the export into. Pass your own working directory unless the user names somewhere else. The filename is derived from the open document's name, and the result reports the full path written. An existing file at that path is never overwritten.
  destination: string;
  // Only meaningful for format "rev". When true (the default, matching the editor's backup export), every asset the document references is downloaded and embedded in the .rev file, which needs network access. Pass false to export a document-only revision with no asset downloads.
  embed_assets?: boolean;
  // The export format. 'riv' is the editor's "Export > For Runtime" action: a .riv file meant to be loaded by a Rive runtime in an app. 'rev' is the editor's "Export > For Backup" action: a .rev native coop file that can be reopened and edited in this editor, meant as a personal backup. There is no default; the caller must choose.
  format: "riv" | "rev";
  // For scripted retries only; default false. This tool ALWAYS tries to write the export to disk first, and only returns the bytes as inline base64 when that write is refused for permissions. This flag exists to enable that fallback for the shell recipe returned in the permission-denied error — do not set it speculatively.
  inline_base64?: boolean;
}): Promise<CallToolResult>; };
```

### mcp__rive__find_objects

Search an artboard by name (case-insensitive substring) and/or type string. Use this to find an object ID when you only know its name or type, then act on that id with layout_editor: appendLayout takes a layout, artboard, group or solo as layoutData.parentId; setLayoutVisibility takes layouts only.

exec tool declaration:
```ts
declare const tools: { mcp__rive__find_objects(args: {
  // The artboard to search. Its id (as returned when listing artboards) or its exact name. When omitted, uses the artboard the editor is currently showing.
  artboardId?: string;
  // Case-insensitive substring to match against object names. Omit to match any name.
  name?: string;
  // Restrict the search to children of this object ID, narrowing within artboardId. Omit to search the entire artboard. An object id as returned by a previous search, never a name.
  parentId?: string;
  // Type string to filter by (e.g. "shape", "rectangle", "text", "group", "node", "ellipse", "artboard"). Omit to match any type.
  type?: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__get_artboard_hierarchy

Get the object tree of an artboard. Use depth=2 or depth=3 for a broad overview, then drill into specific branches. Avoid depth > 6 on complex artboards — the response can be very large.

exec tool declaration:
```ts
declare const tools: { mcp__rive__get_artboard_hierarchy(args: {
  // ID of the artboard to get the hierarchy for. Defaults to the active artboard if not provided.
  artboardId?: string;
  // Maximum depth to traverse. Defaults to 5. Start shallow and increase only if you need to see deeper nesting. Large artboards at depth 20 can produce thousands of tokens.
  depth?: number;
}): Promise<CallToolResult>; };
```

### mcp__rive__get_scripting_reference

Retrieve Rive scripting API definitions and code examples. Use this to look up type definitions before writing code.

Request a topic key such as a builtin definition (e.g. "rive/paint", "rive/vector"), "rules", "viewmodel_definitions", "example_node", or "example_test". Use "rules" before writing a script, and "viewmodel_definitions" when working with ViewModel data.

exec tool declaration:
```ts
declare const tools: { mcp__rive__get_scripting_reference(args: {
  // A definition key (e.g., "rive/paint", "rive/vector"), "rules", "viewmodel_definitions", "example_node", or "example_test".
  topic: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__get_scripts

Lists all editable code files in the workspace — both Luau scripts and WGSL shaders. Each entry includes the module name, language ("luau", "animascript" or "wgsl"), and the script protocol.

exec tool declaration:
```ts
declare const tools: { mcp__rive__get_scripts(args: { [key: string]: unknown; }): Promise<CallToolResult>; };
```

### mcp__rive__get_selection

Returns the id, name, types, and parent id of every currently selected object in the editor.

exec tool declaration:
```ts
declare const tools: { mcp__rive__get_selection(args: { [key: string]: unknown; }): Promise<CallToolResult>; };
```

### mcp__rive__grep

Searches for a pattern across editable code files in the workspace (Luau scripts AND WGSL shaders), similar to the grep command. Returns matching lines with their line numbers. If inclusion_set is provided, only the specified files are searched, otherwise all non-built-in files are searched. Supports case-sensitive matching, whole word matching, and regular expressions.

exec tool declaration:
```ts
declare const tools: { mcp__rive__grep(args: {
  // Whether the search should be case sensitive
  case_sensitive?: boolean;
  // Optional list of script or shader names to limit the search to. If not provided, all non-built-in files are searched.
  inclusion_set?: Array<string>;
  // Whether to match whole words only
  match_whole_word?: boolean;
  // The search pattern string
  pattern: string;
  // Whether the pattern should be treated as a regular expression
  regular_expression?: boolean;
}): Promise<CallToolResult>; };
```

### mcp__rive__group_editor

Create a group (a Node). Pass objectIds to wrap those objects in a group, preserving their on-screen positions and draw order like the editor Group command. Omit objectIds for an empty group to parent things under later. Use this instead of duplicating an existing group.

exec tool declaration:
```ts
declare const tools: { mcp__rive__group_editor(args: {
  // Name for the group. Defaults to "Group".
  name?: string;
  // Objects to wrap. An object listed together with one of its ancestors is wrapped inside that ancestor, not separately. Omit for an empty group.
  objectIds?: Array<string>;
  // Parent for an EMPTY group; defaults to the active artboard. Rejected together with objectIds, since a wrapping group takes the place of what it wraps.
  parentId?: string;
  // X for an empty group, in editor units. Defaults to 0. Ignored when wrapping.
  x?: number;
  // Y for an empty group, in editor units. Defaults to 0. Ignored when wrapping.
  y?: number;
}): Promise<CallToolResult>; };
```

### mcp__rive__layout_editor

Creates UI layouts with flexbox-style positioning, padding, gaps, and alignment. Use this for structured user interfaces.

USE THIS TOOL for:
- UI components (buttons, cards, modals, navigation bars)
- Screen layouts and page structures
- Lists, grids, and content containers
- Text with layout positioning (do NOT use emoji characters)
- Anything requiring flexbox arrangement (rows, columns, wrapping)
- 2-D grids (set layoutStyle.layoutType="grid" and define templateColumns/templateRows) -- may be unavailable on this host; the call fails with guidance if so
- Stacks / overlapping z-ordered content (set layoutStyle.layoutType="stack"; align with `alignment`) -- may be unavailable on this host; the call fails with guidance if so
- Rotated/scaled layouts with a pivot (set the `transform` object; also settable on existing layouts via setPropertyValues)

Layouts can be children of other layouts, the artboard, or a transparent container (a group or Solo).
Text children participate in the layout directly (sized by their layoutStyle width/height scale type) — no wrapper layout. To give text its own background/padding, put it inside its own child layout.
Commands: createLayout (new layout tree), appendLayout (add children), setLayoutVisibility (show/hide layouts - the eye icon on a layout in the inspector, i.e. display: none; hidden layouts render nothing and take no space)

exec tool declaration:
```ts
declare const tools: { mcp__rive__layout_editor(args: { command: "createLayout" | "appendLayout" | "setLayoutVisibility"; data?: { appendLayout?: { layoutData: unknown; }; createLayout?: { artboardId?: string; tree: unknown; }; setLayoutVisibility?: { layoutIds: unknown; visible: boolean; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__list_artboards

List all artboards (id, name, isActive). For "what is the user working on": prefer selectionArtboardId (current selection) over isActive (sticky — persists across deselects).

exec tool declaration:
```ts
declare const tools: { mcp__rive__list_artboards(args: { [key: string]: unknown; }): Promise<CallToolResult>; };
```

### mcp__rive__manage_scripts

Manages the LIFECYCLE of script and shader files: create, rename, move between folders, delete. Use this for any script/shader file-level operation. Does NOT edit script contents — to modify a script's source code, use text_editor. Commands: create: Creates one or more new Luau scripts or WGSL shaders, optionally seeded with content; rename: Renames one or more scripts/shaders by id or path (leaf name only — to relocate, use move); move: Moves one or more scripts/shaders to a target folder (missing folders are created); delete: Deletes one or more scripts/shaders.

exec tool declaration:
```ts
declare const tools: { mcp__rive__manage_scripts(args: { command: "create" | "rename" | "move" | "delete"; data?: { create?: Array<{
  // "luau" creates a Luau script (behavior, logic, converters, etc.). "wgsl" creates a shader for use with the GPU canvas. Defaults to "luau".
  code_file_type?: "luau" | "wgsl";
  // Optional initial source. When omitted, Luau scripts get the boilerplate for their protocol (or empty for utility) and shaders start empty. Prefer seeding here over creating empty and following up with text_editor.
  content?: string;
  // Optional. Slashes group the script into folders, e.g. "utils/Math3D" places "Math3D" inside a "utils" folder (created if missing, reused on exact case-sensitive match). Trailing ".lua" / ".luau" / ".wgsl" / ".txt" is stripped automatically.
  name?: string;
}>; delete?: Array<{
  // The id of the script/shader to delete.
  scriptId?: string;
  // Path of the script/shader to delete, e.g. "utils/Math3D". Use either scriptId or scriptPath.
  scriptPath?: string;
}>; move?: Array<{
  // The id of the script/shader to move.
  scriptId?: string;
  // Current path of the script/shader, e.g. "utils/Math3D". Use either scriptId or scriptPath.
  scriptPath?: string;
  // Destination folder path, e.g. "utils/math3d". Empty string or omitted moves to the workspace root. Folders are created if missing (mirrors create).
  targetFolder?: string;
}>; rename?: Array<{
  // New leaf name only — no slashes. To relocate the file, use the move command instead.
  newName: string;
  // The id of the script/shader to rename.
  scriptId?: string;
  // Current path of the script/shader, e.g. "utils/Math3D". Use either scriptId or scriptPath.
  scriptPath?: string;
}>; }; }): Promise<CallToolResult>; };
```

### mcp__rive__mesh_rigging_tool

Rigs images AND vector shapes for skeletal (bone) animation: generate a deformable mesh, bind bones, and auto-compute vertex weights. This is the Edit Vertices/Mesh workflow (generate -> bind -> auto weight).

USE THIS TOOL for:
- Turning an image into a deformable mesh, traced to its outline (generateMesh)
- Binding one or more bones to a mesh OR a vector path (bindBones)
- Auto-computing how bones influence each vertex (autoWeight)
- Inspecting what bones are bound and their weights (querySkin)

IMPORTANT - binding and weighting work on BOTH image meshes and vector paths. A vector path is rigged directly through Edit Vertices (bindBones/autoWeight on the path); it does NOT need a generated mesh first. Only images need generateMesh before they can be bound.

generateMesh REQUIRES an image to act on. Pass imageId or imageName. If neither is given and nothing usable is selected, do NOT guess - tell the user to select the image they want to mesh, then try again. generateMesh also meshes a Component (component instance) when the Component mesh feature is on: pass the Component id/name as imageId/imageName. The Component must be in Mode: Node; Leaf and Layout are refused with a message to switch Mode first. Trace follows the Component artboard's rendered silhouette; bindBones/autoWeight then work on it like an image mesh.

Typical flow to rig an image: generateMesh -> bindBones -> autoWeight. For a vector path, skip generateMesh: bindBones -> autoWeight. Binding a target the first time auto-weights it, so a separate autoWeight call is only needed to re-run with different settings (blend/maxInfluences) or after changing the bones.

When several overlapping shapes are bound to the SAME bones (an arm split into upper-arm and forearm images), auto-weight them in ONE autoWeight call via targetIds/targetNames: they solve as one surface so the overlap deforms in unison. Weighting them in separate calls gives mismatched weights at the overlap and the artwork tears apart when the joint bends.

Does NOT create bones (use the component tool for that), animate them, or paint individual per-vertex weights.

Targets and bones may be referenced by id (preferred) or by name. maxInfluences is capped at 4 (the runtime limit of bones per vertex). blend is 0..1 where 0 is rigid (each vertex sticks to its nearest bone) and 1 is the widest blend at bone boundaries.

exec tool declaration:
```ts
declare const tools: { mcp__rive__mesh_rigging_tool(args: { command: "generateMesh" | "bindBones" | "autoWeight" | "querySkin"; data?: { autoWeight?: {
  // Blend width at bone boundaries 0..1 (0 rigid, 1 widest blend). Defaults to the editor's Blend default.
  blend?: number;
  // Max bones influencing each vertex (1..4, default 4).
  maxInfluences?: number;
  // Smooth the weights across neighbors (default true).
  smooth?: boolean;
  // Id of the bound mesh or path to auto-weight.
  targetId?: string;
  // Ids of several bound meshes/paths to auto-weight together. Targets bound to the same bones solve as ONE surface so overlapping artwork deforms in unison; always pass all shapes of a multi-image rig in one call.
  targetIds?: Array<string>;
  // Name of the bound mesh or path to auto-weight.
  targetName?: string;
  // Names of several bound meshes/paths to auto-weight together (used for any target not given by id).
  targetNames?: Array<string>;
}; bindBones?: {
  // Ids of the bones to bind.
  boneIds?: Array<string>;
  // Names of the bones to bind (used for any bone not given by id).
  boneNames?: Array<string>;
  // Id of the mesh or path (skinnable) to bind to.
  targetId?: string;
  // Name of the mesh or path to bind to (used if targetId is omitted).
  targetName?: string;
}; generateMesh?: {
  // Trace detail 0..1: higher keeps more outline vertices (tighter fit), lower is coarser. Default 0.5. Only used when trace is true.
  detail?: number;
  // Id of the image to mesh.
  imageId?: string;
  // Name of the image to mesh (used if imageId is omitted).
  imageName?: string;
  // How many times to subdivide the generated mesh for denser interior geometry (0..4, default 0).
  subdivisions?: number;
  // Fit the mesh outline to the image silhouette instead of the default rectangle (default true). Set false only if the user explicitly wants a plain rectangular mesh.
  trace?: boolean;
}; querySkin?: {
  // Also return the weights of every vertex (index, position, per-bone weight). Default false; the per-bone summary is usually enough.
  includeVertexWeights?: boolean;
  // Id of the mesh or path to inspect.
  targetId?: string;
  // Name of the mesh or path to inspect.
  targetName?: string;
}; }; }): Promise<CallToolResult>; };
```

### mcp__rive__open_file_editor

Manage artboards in the file.

Commands:
- getCurrentFile: identify this file: name, location, and editor url. Rive files live in the cloud, so there is no path on disk.
- listArtboards: list all artboards (name, size, position).
- getSelectedArtboard: get the active/selected artboard.
- focusArtboard: make an artboard active by id or name.
- renameArtboard: rename artboards by id or name.
- arrangeArtboard: move artboards to a new x/y position.
- resizeArtboard: change artboard width and/or height.
- createArtboard: create one or more artboards. Do NOT set x/y unless the user asks for an exact position. Rive automatically places each new artboard in free space (so it never covers an existing artboard) and moves the view to show it - you do not need to position, focus, or scroll to it yourself.
- closeRevisionHistory: close the Revision History panel. While it is open the file is view only and all editing commands fail; close it only when the user wants to resume editing.
- undo: revert the last change you made.

exec tool declaration:
```ts
declare const tools: { mcp__rive__open_file_editor(args: { command: "getCurrentFile" | "listArtboards" | "getSelectedArtboard" | "focusArtboard" | "renameArtboard" | "arrangeArtboard" | "resizeArtboard" | "createArtboard" | "closeRevisionHistory" | "undo"; data?: { arrangeArtboard?: Array<{
  // The ID of the artboard to arrange
  artboardId?: string;
  // The name of the artboard to arrange
  artboardName?: string;
  // The new X position of the artboard
  x?: number;
  // The new Y position of the artboard
  y?: number;
}>; closeRevisionHistory?: { [key: string]: unknown; }; createArtboard?: Array<{
  // The height of the new artboard (defaults to 100)
  height?: number;
  // Whether this artboard can be used as a Component in other Artboards
  isComponent?: boolean;
  // The name of the new artboard
  name?: string;
  // The width of the new artboard (defaults to 100)
  width?: number;
  // Exact X position. Leave unset in almost all cases: Rive auto-places the artboard in free space. Only set it when the user gives a specific location.
  x?: number;
  // Exact Y position. Leave unset in almost all cases: Rive auto-places the artboard in free space. Only set it when the user gives a specific location.
  y?: number;
}>; focusArtboard?: {
  // The ID of the artboard to focus
  artboardId?: string;
  // The name of the artboard to focus
  artboardName?: string;
  // Whether to fit the artboard into the viewport
  fitToViewport?: boolean;
}; getCurrentFile?: { [key: string]: unknown; }; getSelectedArtboard?: { [key: string]: unknown; }; listArtboards?: { [key: string]: unknown; }; renameArtboard?: Array<{
  // The ID of the artboard to rename
  artboardId?: string;
  // The current name of the artboard to rename
  artboardName?: string;
  // The new name for the artboard
  newName: string;
}>; resizeArtboard?: Array<{
  // The ID of the artboard to resize
  artboardId?: string;
  // The name of the artboard to resize
  artboardName?: string;
  // The new height of the artboard
  height?: number;
  // The new width of the artboard
  width?: number;
}>; undo?: { [key: string]: unknown; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__path_editor

Creates shapes in Rive. DEFAULT to createParametricShapes for any geometric primitive (rectangle, ellipse, triangle, polygon, star): e.g. "a box" or "a rounded rectangle" is a parametric rectangle with cornerRadius, NEVER hand-built from path commands. These are the same objects the editor shape tools make, with real editable properties (width, height, cornerRadius, points, innerRadius). Use createShapes with raw path commands ONLY for freeform/custom vectors that no primitive can express. IMPORTANT for createShapes: a shape is invisible without paths AND commands. Every shape MUST have at least one path with at least one moveTo and one lineTo/cubicTo. Every filled path MUST end with a close command. VALID paintType values (exact strings): "fill" or "stroke". VALID commandType values (exact strings): "moveTo" (requires x,y — sets the start point), "lineTo" (requires x,y — draws a straight segment), "cubicTo" (requires control1X,control1Y,control2X,control2Y,endX,endY — bezier curve), "close" (no args — closes the path back to moveTo point, required for fills). COORDINATE SYSTEM: A shape's x/y are in its PARENT's local space. Path commands are in the shape's OWN local space, drawn around (0,0). A layout's origin is its TOP-LEFT corner. A shape's x/y positions its center relative to that. To align a shape inside a layout, wrap it in a child layout the same size as the shape, set the PARENT layout's alignment, and place the shape at x=W/2, y=H/2 inside the child layout. Supports commands: createParametricShapes: Creates parametric primitives (rectangle/ellipse/triangle/polygon/star) with their editor properties; createShapes: Creates freeform shapes from raw path commands; addVertices: Adds vertices to an existing PointsPath by ID; addPaths: Adds new paths to an existing Shape by ID; addPaints: Adds new fills or strokes to an existing paint container by ID (a Shape, a LayoutComponent or Artboard for a background, or a text run's TextStylePaint); setPaints: Recolors EXISTING fills/strokes by ID, including switching a solid color to a linear/radial gradient or back; addGradientStops: Adds color stops to an existing gradient; removeGradientStops: Removes color stops from a gradient; addTrimPaths: Adds a trim path effect to existing fills/strokes by ID, trimming the rendered outline to a portion of its length. This is how a draw-on/write-on reveal is built: keyframe the trim start/end over time with animation_editor. start/end/offset are percentages (0-100), matching the inspector; mode is sequential (trims the paths end to end as one run) or synchronized (trims every path by the same amount). To retune an EXISTING trim, do not add a second one: queryObjects reports the effects on each paint with their ids, so write start/end/offset with query_core_object_tool setPropertyValues; To MOVE a gradient or retune one of its existing stops, do NOT use this tool: write the properties directly with query_core_object_tool setPropertyValues (the gradient's startX/startY/endX/endY and opacity, or a stop's position and colorValue). queryObjects reports gradientId and each stop id. combineShapes: Boolean-combines overlapping shapes (Shape Builder). merge unions the shapes into one; extractRegion pulls the region under a point into a new shape; eraseRegion deletes it. DESTRUCTIVE: flattens sources to plain paths and removes consumed shapes. Blocked when anything depends on the shapes and would not be removed with them (external dependents, cross-shape constraints, references into path geometry). When the operation would destroy animation keys (any keys on shapes it consumes; keys on path geometry of shapes it touches), the call errors listing them unless confirmKeyLoss: true is passed. Keys on a surviving shape's transform survive with it. Points are in artboard space; 

USE createParametricShapes for:
- Rectangles, squares (incl. rounded corners), circles, ellipses
- Triangles, polygons, stars
USE createShapes (raw paths) for:
- Freeform curves, arcs, custom silhouettes
- Simple lines, arrows, or connectors
- Shapes no parametric primitive can express

exec tool declaration:
```ts
declare const tools: { mcp__rive__path_editor(args: { command: "createShapes" | "createParametricShapes" | "addVertices" | "addPaths" | "addPaints" | "setPaints" | "addGradientStops" | "removeGradientStops" | "addTrimPaths" | "combineShapes"; data?: { addGradientStops?: { gradientId: string; stops: unknown; }; addPaints?: { paints: unknown; shapeId: string; }; addPaths?: { paths: unknown; shapeId: string; }; addTrimPaths?: { end?: number; mode?: "sequential" | "synchronized"; offset?: number; paintIds: unknown; start?: number; }; addVertices?: { pathId: string; vertices: unknown; }; combineShapes?: { confirmKeyLoss?: boolean; operation: "merge" | "extractRegion" | "eraseRegion"; point?: unknown; shapeIds: unknown; }; createParametricShapes?: { shapes: unknown; }; createShapes?: { shapes: unknown; }; removeGradientStops?: { stopIds: unknown; }; setPaints?: { color?: string; gradient?: unknown; paintIds: unknown; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__property_group_editor

Creates Custom Property Groups and the typed Custom Properties they contain on a parent (artboard or any container component). The resulting properties can be data-bound (use viewmodel_editor databind with the property's id and returned bindKey) and keyframed on a timeline (use animation_editor with the same id and returned keyframeKey, which is type-specific such as firePropertyKey for triggers). NOT for interactivity: listeners and transition conditions read ViewModel properties (viewmodel_editor), not custom properties. Property types: number, boolean, color, string, enum, trigger. Commands: addPropertyGroups: Creates one or more property groups, each with an optional initial set of properties; addPropertiesToGroup: Adds properties to an existing group.

exec tool declaration:
```ts
declare const tools: { mcp__rive__property_group_editor(args: { command: "addPropertyGroups" | "addPropertiesToGroup"; data?: { addPropertiesToGroup?: {
  // ID of the existing CustomPropertyGroup to add properties to.
  groupId: string;
  // List of typed custom properties to create in the group.
  properties: Array<{
  // Required for enum properties: id of the DataEnum that defines this property's allowed values.
  enumId?: string;
  // Display name for the property.
  name: string;
  propertyType: "number" | "boolean" | "color" | "string" | "enum" | "trigger";
  value?: unknown;
}>;
}; addPropertyGroups?: { groups: Array<{
  // Optional name for the property group.
  name?: string;
  // ID of the parent ContainerComponent (artboard or any container component) to attach the group to.
  parentId: string;
  // List of typed custom properties to create in the group.
  properties?: Array<{
  // Required for enum properties: id of the DataEnum that defines this property's allowed values.
  enumId?: string;
  // Display name for the property.
  name: string;
  propertyType: "number" | "boolean" | "color" | "string" | "enum" | "trigger";
  value?: unknown;
}>;
}>; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__query_objects

Get id, type, name, and children for objects (depth-limited). If objectIds are not provided, defaults to currently selected objects.

exec tool declaration:
```ts
declare const tools: { mcp__rive__query_objects(args: {
  // Maximum depth to traverse children (0 = no children, 1 = direct children only, etc.). Defaults to 5 if not provided.
  depth?: number;
  // Array of object IDs to query for. If not provided, defaults to currently selected objects.
  objectIds?: Array<string>;
}): Promise<CallToolResult>; };
```

### mcp__rive__query_property_keys

Get the available properties on objects by object IDs. Returns human-readable property names mapped to integer keys. Enum-backed properties also include an `enums` entry (propertyKey -> [name0, name1, ...]); the array index is the uint value to pass to set_property_values.

exec tool declaration:
```ts
declare const tools: { mcp__rive__query_property_keys(args: {
  // Include only properties that can be animated
  animates?: boolean;
  // Include only properties that can be used in databind
  binds?: boolean;
  // Array of object IDs to query properties for
  objectIds: Array<string>;
}): Promise<CallToolResult>; };
```

### mcp__rive__query_property_values

Get current values for object properties by object IDs and property keys. Numeric values are returned in the units the editor UI shows: percent-displayed properties (opacity, scale, trim path, constraint strength) as 0-100 style percentages, rotation in degrees.

exec tool declaration:
```ts
declare const tools: { mcp__rive__query_property_values(args: {
  // Object Id to array of property keys to get values for.
  propertyKeys: { [key: string]: Array<number>; };
}): Promise<CallToolResult>; };
```

### mcp__rive__read_console

Reads console output from script execution. Use this to examine print statements and errors from Rive scripts.

IMPORTANT: The console only contains output from script executions that have already occurred. If you need to see output from a specific operation:
1. Ask the user to perform the action that triggers the script (e.g., play the animation, interact with the state machine)
2. Once they confirm the action is complete, use this tool to read the results.

You can filter results by script name, entry type (print/error), or search for specific text within the output.

exec tool declaration:
```ts
declare const tools: { mcp__rive__read_console(args: {
  // Filter by entry type: 'print' for standard output, 'error' for errors
  entry_type?: "print" | "error";
  // Maximum number of entries to return (default: 100)
  limit?: number;
  // Number of matching entries to skip (for pagination)
  offset?: number;
  // When true, returns results in reverse order (newest first). Use with limit to get the most recent entries.
  reverse?: boolean;
  // Filter entries to only those from this script
  script_name?: string;
  // Case-insensitive search for text within console output
  text_search?: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__recompile_all_scripts

Recompiles all scripts and updates their bytecode, committing all changes to the Luau virtual machine.

exec tool declaration:
```ts
declare const tools: { mcp__rive__recompile_all_scripts(args: { [key: string]: unknown; }): Promise<CallToolResult>; };
```

### mcp__rive__rename_objects

Rename objects by their IDs. Each entry needs both id (the object to rename) and name (its new name); an entry missing either fails the whole call without renaming anything. An id that matches no object is reported in errors.

exec tool declaration:
```ts
declare const tools: { mcp__rive__rename_objects(args: {
  // List of id/name pairs to rename.
  renames: Array<{
  // The object ID to rename.
  id: string;
  // The new name for the object.
  name: string;
}>;
}): Promise<CallToolResult>; };
```

### mcp__rive__reorder_objects

Change draw order (z-order): sendToFront, bringForward, sendBackward, or sendToBack. An entry missing objectId or order fails the whole call without reordering anything; an id that matches no object is reported in errors.

exec tool declaration:
```ts
declare const tools: { mcp__rive__reorder_objects(args: {
  // List of reorder operations to apply in order.
  operations: Array<{
  // The object ID to reorder.
  objectId: string;
  // sendToFront: draw on top of all siblings; bringForward: move one step toward the front; sendBackward: move one step toward the back; sendToBack: draw behind all siblings.
  order: "sendToFront" | "bringForward" | "sendBackward" | "sendToBack";
}>;
}): Promise<CallToolResult>; };
```

### mcp__rive__reparent_objects

Move objects to a different parent in the hierarchy. Editor parenting rules apply (e.g. layouts parent to layouts, the artboard, or transparent containers like groups/Solos); invalid moves are rejected per-operation. An entry missing objectId or newParentId fails the whole call without moving anything.

exec tool declaration:
```ts
declare const tools: { mcp__rive__reparent_objects(args: {
  // List of reparent operations to apply.
  operations: Array<{
  // The ID of the new parent. Any container component works (artboard, group, layout, solo, shape, bone, ...). Editor parenting rules apply, e.g. layouts parent to layouts, the artboard, or transparent containers (groups/Solos), and paths only live under shapes; invalid moves are rejected per-operation.
  newParentId: string;
  // The object ID to move.
  objectId: string;
  // Where to insert within the new parent. start = front (on top), end = back (behind). Defaults to end.
  position?: "start" | "end";
}>;
}): Promise<CallToolResult>; };
```

### mcp__rive__run_tests

Runs the tests for a given Tests script

exec tool declaration:
```ts
declare const tools: { mcp__rive__run_tests(args: {
  // The file path to the script to run tests for
  path: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__script_diagnostics

Get analysis/linter errors and warnings from either a specific script if "path" is provided or all diagnostics for every script in the workspace if no path is provided

exec tool declaration:
```ts
declare const tools: { mcp__rive__script_diagnostics(args: {
  // The file path to retrieve diagnostics (errors and warnings) for.
  path?: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__select_objects

Select objects in the editor by their IDs. Pass an empty array to clear the selection.

exec tool declaration:
```ts
declare const tools: { mcp__rive__select_objects(args: {
  // Array of object IDs to select in the editor. Pass an empty array to clear the selection.
  objectIds: Array<string>;
}): Promise<CallToolResult>; };
```

### mcp__rive__session_info

List the files open in the editor and which tab is active. Read-only. Rive files live in the cloud, so there is no path on disk; use the returned url to refer to a file.

exec tool declaration:
```ts
declare const tools: { mcp__rive__session_info(args: { [key: string]: unknown; }): Promise<CallToolResult>; };
```

### mcp__rive__set_property_values

Set values for object properties by object IDs and property keys. Numeric values use the units the editor UI shows: percent-displayed properties (opacity, scale, trim path, constraint strength) take 0-100 style percentages and rotation takes degrees; they are converted and clamped like inspector input. Invalid writes are rejected per-property in an errors list with machine-readable codes (invalid_enum_value, unknown_id, type_mismatch, read_only, ...).

exec tool declaration:
```ts
declare const tools: { mcp__rive__set_property_values(args: {
  // Object Id to map of property keys to values: Map<Id, Map<int, int|string|color|bool>>
  propertyValues: { [key: string]: { [key: string]: unknown; }; };
}): Promise<CallToolResult>; };
```

### mcp__rive__tag_editor

Read and manage tags: colored labels that organize components, animations, assets, and viewmodel properties across the editor panels. Editor organization only - tags are NOT exported to the .riv and have no runtime behavior. queryTags: All tags with color, hidden/locked, tagged count; createTags: New tags (name, optional #rrggbb/#aarrggbb color, hidden, locked); updateTags: Rename/recolor/set hidden or locked; deleteTags: Delete tags (untags every object); assignTags/unassignTags: Apply or remove tags on objects (shapes, groups, animations, assets, viewmodel properties...). Write commands require a plan with tags and error if the workspace lacks it.

exec tool declaration:
```ts
declare const tools: { mcp__rive__tag_editor(args: { command: "queryTags" | "createTags" | "updateTags" | "deleteTags" | "assignTags" | "unassignTags"; data?: { assignTags?: { tagIds?: Array<string>; tagNames?: Array<string>; targetIds?: Array<string>; targetNames?: Array<string>; }; createTags?: { tags: Array<{
  // #rrggbb or #aarrggbb.
  color?: string;
  hidden?: boolean;
  locked?: boolean;
  name: string;
}>; }; deleteTags?: { tagIds?: Array<string>; tagNames?: Array<string>; }; queryTags?: {
  // Include per-tag id/name/type of every tagged object. Default false (counts only).
  includeTaggedObjects?: boolean;
}; unassignTags?: { tagIds?: Array<string>; tagNames?: Array<string>; targetIds?: Array<string>; targetNames?: Array<string>; }; updateTags?: { tags: Array<{
  color?: string;
  hidden?: boolean;
  locked?: boolean;
  name?: string;
  tagId?: string;
  // Alternative to tagId; errors if the name is ambiguous.
  tagName?: string;
}>; }; }; }): Promise<CallToolResult>; };
```

### mcp__rive__text_editor

View and edit EXISTING scripts in the workspace. STRICTLY for reading and modifying files that already exist. Do NOT use this tool to create new scripts — use create_script instead.

exec tool declaration:
```ts
declare const tools: { mcp__rive__text_editor(args: {
  // The command to execute:
  // - view: View an existing file's contents
  // - str_replace: Replace text in an EXISTING file (file must already exist)
  // - insert: Append text to an EXISTING file (file must already exist)
  command: "view" | "str_replace" | "insert";
  // The replacement text (for str_replace command)
  new_string?: string;
  // The text to replace (for str_replace command)
  old_string?: string;
  // The file path to operate on
  path: string;
  // The text content (for insert command)
  text?: string;
  // Optional range of lines to view (1-indexed, inclusive). If provided, returns only the specified line range with line numbers prepended as "lineNumber: line".
  view_range?: {
  // The ending line number (1-indexed, inclusive)
  end_line: number;
  // The starting line number (1-indexed, inclusive)
  start_line: number;
};
}): Promise<CallToolResult>; };
```

### mcp__rive__upload_asset

Adds ONE image (png/jpeg/webp), SVG, font (ttf/otf), or audio (mp3/wav/flac) asset to the currently open file. Returns the new asset's id and metadata. Does NOT place anything on the stage: instantiating the asset onto an artboard is a separate operation (assets_tool's addImageInstance or addSvgInstance).

exec tool declaration:
```ts
declare const tools: { mcp__rive__upload_asset(args: {
  // The asset to add. Preferred: an RFC 2397 data URI of the form data:<mediatype>;name=<url-encoded-filename>;base64,<data>. Also accepted (localhost only): an absolute local filesystem path or a file:// URI to the asset on disk. The asset type is detected automatically: images, fonts and SVG from the file content, and audio from the filename extension (an audio data URI's name=, or a local path, must end in .mp3, .wav, or .flac). An SVG that opens with an XML declaration instead of <svg needs mediatype image/svg+xml or a .svg filename. If a local path fails with a permission error (the editor may be sandboxed, e.g. on macOS), retry with a data URI — it requires no file access by the editor. Do not generate the base64 yourself; the permission-error result includes a step-by-step curl recipe for scripting the upload.
  file: string;
  // Optional display name for the new asset (extension omitted; a recognized asset extension is stripped if included). Defaults to the uploaded filename.
  name?: string;
}): Promise<CallToolResult>; };
```

### mcp__rive__upload_rev

Uploads a Rive document (.rev, the native coop-serialized format) to one of two destinations, chosen by the required "target" parameter: "open_file" imports it into the currently open file, which must be empty; "current_project" instead uploads it as a brand-new file in the open file's project, leaving the open file untouched, and returns the new file's id.

exec tool declaration:
```ts
declare const tools: { mcp__rive__upload_rev(args: {
  // The .rev document to upload. Preferred: an RFC 2397 data URI of the form data:<mediatype>;name=<url-encoded-filename>;base64,<data> (mediatype can be application/octet-stream; .rev has no registered MIME type). Also accepted (localhost only): an absolute local filesystem path or a file:// URI to the .rev on disk. The content is validated as a coop revision regardless of filename. If a local path fails with a permission error (the editor may be sandboxed, e.g. on macOS), retry with a data URI — it requires no file access by the editor. Do not generate the base64 yourself; the permission-error result includes a step-by-step curl recipe for scripting the upload.
  file: string;
  // Where to put the uploaded document. "open_file" imports it into the currently open file, which must be empty (no existing content) — the import fails otherwise. "current_project" instead uploads it as a brand-new file in the open file's project, leaving the open file untouched, and returns the new file's id.
  target: "open_file" | "current_project";
}): Promise<CallToolResult>; };
```

### mcp__rive__viewmodel_editor

Creates and manages view models and their instances. Supports commands like,listViewModels: Lists all view models; createViewModels: Creates view models with properties; createViewModelInstances: Creates instances of a view model; addProperties: Adds properties to existing view models. A viewModel-typed property references another view model by viewModelId (preferred) or viewModelName, which may name one created in the same call; databind: Makes the value of an object's property come from a viewmodel instance. When binding strings to text, you must bind to the Text Run, not the Text object itself. Re-running databind on an already-bound object property retargets the existing bind. Properties on nested viewmodels need path when several routes reach them; isRelative makes the bind resolve by names from the bound instance (the relative toggle); modifyDataBind: Modifies an existing data bind's direction (toTarget, toSource, twoWay), once flag, source-to-target ordering, attached converter, source path, or relative flag; bindViewModelToArtboard: Binds a viewmodel instance to an artboard; bindViewModelToComponent: Sets a component placement's own data context (the Model/Path rows in the inspector). Use this - not raw property writes - to point each placement of the same component at its own viewmodel property, clear it back to inherit, or assign a specific instance. Accepts multiple placements at once. Not available for stateful components (their instance is auto-managed); listViewModelInstances: Lists all view model instances from a view model; listDataBinds: Lists existing data binds with their source paths and flags; createConverters: Creates data converters to transform a bound value (for example convertToString so a number property can drive a text run). Pass the returned id as a binding's converterId in databind, then tune settings with query_core_object_tool setPropertyValues. Use a group to chain several transforms into one converter (its children are created or reused in the same call) and a formula for arithmetic. Check listConverters first and reuse a match: converters cannot be deleted here, so one created by mistake stays in the data panel for the user to remove; listConverters: Lists existing converters with their type and id, so one can be reused instead of creating a duplicate; listDataEnums: Lists enums (the Enums section of the data panel) with their values; createDataEnums: Creates enums and their values. Create the enum before an enum property that uses it; addDataEnumValues: Appends values to an existing enum; removeDataEnumValues: Removes values from an enum; deleteDataEnums: Deletes whole enums and their values. Needs force: true to delete one that still backs properties, and sweeps any library assets the removal leaves unused. An enum property is a viewModelProperties entry with propertyType enum plus enumName or enumId; 

exec tool declaration:
```ts
declare const tools: { mcp__rive__viewmodel_editor(args: { command: "listViewModels" | "createViewModels" | "createViewModelInstances" | "addProperties" | "databind" | "modifyDataBind" | "bindViewModelToArtboard" | "bindViewModelToComponent" | "listViewModelInstances" | "listDataBinds" | "createConverters" | "listConverters" | "listDataEnums" | "createDataEnums" | "addDataEnumValues" | "removeDataEnumValues" | "deleteDataEnums"; data?: { addDataEnumValues?: unknown & unknown; addProperties?: { viewModels: unknown; }; bindViewModelToArtboard?: { artboardId: string; viewModelId: string; viewModelInstanceId?: string; }; bindViewModelToComponent?: unknown & unknown; createConverters?: { converters: unknown; }; createDataEnums?: { dataEnums: unknown; }; createViewModelInstances?: { instances: unknown; viewModelId: string; }; createViewModels?: { viewModels: unknown; }; databind?: { bindings: unknown; viewModelId: string; }; deleteDataEnums?: unknown | unknown; listConverters?: { [key: string]: unknown; }; listDataBinds?: { objectId?: string; }; listDataEnums?: { [key: string]: unknown; }; listViewModelInstances?: { viewModelId: string; }; listViewModels?: { [key: string]: unknown; }; modifyDataBind?: { converterId?: string; direction?: "toTarget" | "toSource"; isRelative?: boolean; objectId: string; once?: boolean; path?: string; propertyKey: number; sourceToTargetRunsFirst?: boolean; twoWay?: boolean; }; removeDataEnumValues?: unknown & unknown; }; }): Promise<CallToolResult>; };
```

