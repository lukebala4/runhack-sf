# Creative warehouse verification

16 October 2026. Local-only implementation; no production deployment.

## Coverage

41 unique catalog records: 12 website concepts, 13 image/identity/drawing assets, 3 motion resources, 5 reference collections and 8 planning/research entries. The Pinterest gallery itself retains all 30 pins. The original pair, five first-merge headline versions and five fresh-air versions are each directly navigable.

The first-merge wording was restored from the retained screenshots and current retained layout source. Those cards and snapshots are marked restored; no claim is made that this is a byte-exact former source revision. All new saved snapshots are independent of the active renderer and have code/asset hashes.

## Executed checks

- All 76 unique local catalog destinations, thumbnails and secondary links returned HTTP 200. External source websites were retained as reference links, not re-audited.
- Every raster preview decoded successfully. All six frozen renderer files per round matched their recorded hashes. All frozen assets matched their manifests. Both independently preserved original PNGs still match their original hashes.
- Real Computer browser checks opened all 12 saved concepts. Each displayed its correct headline and round, with a loaded hero and no horizontal overflow at 1445 CSS px. The restored Morning club was visually inspected against its retained composition.
- Search narrowed the original pair to one field result. The no-match state and reset returned to the full collection. Category counts were verified: websites 12, images 13, motion 3, references 5, research 8.
- Stars worked, persisted after reload, and were removed after the test, returning the shortlist to empty. They remain browser-local, as documented.
- The image library and dashboard were reviewed at 383, 733 and 323 CSS px without horizontal overflow. Logo previews were inspected on phone in both ink and white variants. Website-round filtering is hidden for categories where it does not apply.
- Opened the rendered SF planning note and returned through the warehouse link. Snapshot return links, source-page return links and the live workspace remain accessible. No warnings/errors were captured in the reviewed browser pages.
- JavaScript syntax, Python compilation and CSS parsing passed.
- Root independently exercised the snapshot utility in a temporary tree with six exported concepts: complete catalog coverage, newest-first ordering, source code/image edits leaving earlier snapshots intact, unchanged assets reusing one set, changed assets producing another, duplicate refusal, injected catalog-write failure rollback, successful same-ID retry and every saved hash.
- A separate agent independently confirmed the same cases plus single-process lock contention, unsafe IDs, tampered asset refusal, originals/restored modes and partial-copy cleanup. No test altered the actual saved rounds.

Detailed browser observations: `browser-checks.json`. Visual proof: `warehouse-desktop.jpg`, `warehouse-mobile.jpg`, `restored-morning-club.jpg` and both `original-*-website.jpg` files.

## Operational boundary

This is a filesystem-backed local collection with an explicit save command and project instructions to save before iterating. It is not a background watcher. Keep the whole SF planning directory together, including relative asset symlinks. The earlier one-time bootstrap encountered syntax errors during authoring; those were corrected before execution, and the resulting catalog/snapshots passed the checks above. A catalog-failure recovery gap found during testing was fixed and rechecked before delivery.
