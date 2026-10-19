# Rive: executed follow-up

16 October 2026. This supersedes the initial connection failure recorded in the capability audit.

## Delivered

- Computer opened the installed native Rive editor; the MCP service immediately responded again.
- A new personal file was created: https://editor.rive.app/file/untitled/2659506 . It retains the default cloud file name `Untitled`.
- Original native vector artwork was imported as editable shapes. The SVG importer recentered its nodes, so shoulder/elbow/hip/knee/ankle pivots were repaired while preserving the visible pose. Before/after artboard captures matched in composition.
- The existing default timeline and default connected state machine were reused and renamed `Morning stride` and `Morning Run`.
- 539 keys coordinate opposite limbs, knee recovery, ankle orientation and a small vertical body rhythm. The loop is 48 frames at 60 fps / 0.8 seconds.
- A 145-frame state-machine simulation reached `Morning stride` from Entry, observed the expected unconditional transition and continued running.
- A real `.riv` export (14,909 bytes, `RIVE` header) and editable `.rev` backup (39,194 bytes, SVG embedded) are saved in `assets/rive/`.
- The runtime scene is integrated into the Track morning hero, `motion.html`, and the Rive capability guide. The field concept keeps its static crew sketch.

## Browser and code checks

- Computer / in-app browser loaded the real scene with `data-state=ready` and no warning/error console entries.
- Wide hero inspected at approximately 1445 CSS px; small runner does not overlap the title, body text or photograph.
- Mobile motion preview inspected at 383 CSS px: full figure, working controls, no horizontal overflow.
- Pause changed the control to Resume; two paused screenshots had identical decoded pixels. The live capture contains 40 distinct frames over 1.9 seconds, covering more than two stride cycles.
- The twelve-pose contact sheet covers a complete stride and was inspected for body scale, opposing limbs, knee bend, foot orientation, cropping and consistent line/colour treatment. The GIF preserves browser capture timing, trimmed to approximately two stride cycles for looping (variable capture cadence, not a deterministic 60 fps render).
- Both source modules passed Node syntax checks. The actual module passed all four lifecycle scenarios in `runner-lifecycle-check.mjs`. Root reran the harness independently.
- The lifecycle tests use DOM/runtime stubs: initial reduced motion, live reduced motion, rapid preference toggling and cleanup before runtime loading completes. No OS accessibility preference was changed, so a real OS-preference switch is not claimed.
- All eight delivery URLs returned HTTP 200. The capability guide loaded 40 tools; `mesh` filtered to one, and clearing restored the full catalogue.
- File sizes, SHA-256 values and lifecycle results are reconciled in `rive-delivery-checks.json`.

## Issues encountered and resolution

- Native editor was closed. Launching it with Computer restored the MCP connection.
- Direct asset reads and exports were refused by the macOS sandbox. The MCP tool's own documented data-URI / inline transfer recipe succeeded; `rive_transfer.py` retains the workflow without printing binary payloads.
- Imported group origins were at bounding-box centres. Joint-local transforms were reconstructed and child geometry offset to preserve the drawing.
- `renameAnimations` rejected its loosely typed payload. The exposed animation name property was successfully used instead. The default timeline was reused, with no duplicate animation/state machine.
- An initial native UI file rename did not persist. The cloud file therefore remains `Untitled`; the local exports and all scene entities have clear names.
- A rapid reduced-motion toggle could construct two runtime instances during a pending shared load. A generation token fixed the race; reproduction went from two instances / one leaked to one instance / zero leaked.
- The browser's clipped capture coordinates did not align with its scaled screenshot. Those failed captures were discarded. Full screenshots were recorded and cropped afterward; the complete captures and timing remain in `rive-playback/`.
- IAB viewport overrides used a different scale from CSS pixels. Breakpoints were verified against measured DOM widths, then the override was reset.

This is a stylised motion study, not a claim that a final hand-animated performance has been art-directed. It uses jointed vectors rather than newly authored Rive bones or Luau scripts. No production site was changed, nothing was published and no plan was purchased. This account exported both formats successfully; the conflicting general free-plan documentation was not resolved for every account.
