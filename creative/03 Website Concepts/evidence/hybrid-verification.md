# Five merged concepts: executed verification

16 October 2026. Local prototypes only.

- All five generated PNGs inspected independently by root, decoded with Pillow, and served byte-identically over localhost HTTP 200. Every scene contains both the track and field; exact generation prompts and hashes are in `hybrid-prompts-a.md` and `hybrid-prompts-b.md`.
- Real Computer browser review of all five complete hero layouts at 1445 CSS px and 383 CSS px. Additional checks covered all five at 980, 733 and 323 CSS px. All 25 concept/width combinations had equal body client/scroll widths and no overflowing headline boxes. Results are in `hybrid-responsive-checks.json`.
- Fixed tablet column collisions, mobile rear-view headline overlap, mobile meadow cropping, and narrow phone navigation. Rechecked the corrected output. The 323px navigation now keeps the city link on one line.
- Five comparison cards render in two desktop columns with a centered fifth card, and one phone column. All five iframe URLs resolve to their corresponding concept. Visually inspected each loaded preview. Embedded previews skip Rive runtime initialization.
- Verified the concept picker, original Track morning and Midsummer fields routes and their original asset paths, comparison navigation, notes dialog with all five descriptions, archive navigation, and idea/format/SF anchors. The common lower sections and footer were inspected on desktop and phone. Morning club's below-fold native Rive instance reached `data-state="ready"`.
- No browser warnings/errors were captured in the reviewed concept or phone comparison. JavaScript syntax checks passed for `hybrids.js` and `studio.js`; both CSS files parsed without errors using tinycss2.
- Both archived original PNGs remain byte-identical to their untouched source files and match the archive manifest's saved sizes and SHA-256 values.

## Visual evidence

`hybrid-1-desktop.jpg` through `hybrid-5-desktop.jpg` are final, full-width viewport captures, not full-page exports. Corresponding `-mobile.jpg` files are final native viewport captures. `hybrid-idea-desktop.jpg`, `hybrid-sf-desktop.jpg`, `hybrid-format-mobile.jpg` and `hybrid-sf-mobile.jpg` show the lower page. `hybrid-comparison-top.jpg`, `hybrid-comparison-middle.jpg` and `hybrid-comparison-mobile.jpg` show the gallery. `five-hybrid-concepts.jpg` is a labeled contact sheet composed from the five actual desktop viewport screenshots.

The browser's full-page screenshot API initially cropped captures under a viewport override. Those five desktop/mobile files were replaced using native viewport captures; scroll and anchor observations supplied the lower-page evidence. A viewport override stopped affecting a document after cross-page navigation; a fresh local QA tab restored it. Temporary overrides were reset. These were capture/control issues, not layout overflow.

## Boundaries

The five photos are imagined AI-generated scenes, warmer/golden and cleaner than raw candid film photography. They are not documentary SF event photographs. Dates, venue and registration remain unannounced. No production repository or deployment was changed.

## Chosen catchphrase

Updated all five main hero headlines to the user's exact wording, **Good ideas need fresh air**. Both archived originals remain intact. Responsive line breaks preserve a large two-line phone statement; Morning club uses three lines in the desktop split. Browser review covered all five at 1445, 980, 733, 383 and 323 CSS px, with exact visible wording and no body/headline overflow in all 25 checks. Data: `catchphrase-fit-checks.json`. Current screenshots: `catchphrase-1-desktop.jpg` through `catchphrase-5-desktop.jpg`, with corresponding `-mobile.jpg` files. The earlier `hybrid-*` captures document the preceding iteration.
