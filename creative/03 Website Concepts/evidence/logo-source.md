# Running Hackathon wordmark

The user selected the logo from https://www.runninghackathon.com/ and requested omission of the v.02 edition label. This supersedes the previously used slashed/abbreviated wordmark.

The live site was checked in Computer. Both home-logo links load `https://www.runninghackathon.com/brand/running-hackathon-v02.png`, with alt text `Running Hackathon v.02`. Its lettering is stacked RUNNING / HACKATHON in Barlow Condensed ExtraBold italic.

The source exists locally in `Event Management and Websites/Barcelona Website - Hero Branch/`. Its `scripts/export-approved-wordmark.py` reproduces organiser-selected option 11 exactly, as documented by that source project. The font is `public/fonts/barlow-condensed-latin-italic-800.woff2`.

`build-running-hackathon-wordmark.py` converts those original font outlines to native SVG paths using the source's exact per-character tracking, 112-unit cap heights and 10-unit line gap. It does not add the edition layer. The resulting 651.352 × 234 viewBox closely matches the original 651.25 × 234 raster canvas; tiny extent differences come from vector curve bounds versus antialiased bitmap bounds. This is a vector reconstruction from the approved source, not a claim of identical bitmap pixels.

- `assets/running-hackathon-wordmark.svg`: paper-compatible ink variant.
- `assets/running-hackathon-wordmark-white.svg`: reversed variant.
- Each has 16 outlined glyph paths, no embedded raster, no text nodes and no font request at runtime.
- The font's original OFL license is retained in `assets/licenses/barlowcondensed-OFL.txt`.

Updated active concepts, navigation logos, footer logos, favicon references, browser titles, accessibility labels, motion page and Rive guide. The planning/reference page brand labels and current project guidance were also updated. Existing production repositories, original logo source assets, historical screenshots and image-generation prompts were preserved.

Computer confirmed the logo loads, matches the stacked lettering and has no edition label. The desktop comparison was inspected with both concepts side by side. At the mobile breakpoint the header logo is 140 × 50.3 CSS px; header and link bounds fit within the measured page width. The in-app browser's scaled screenshot clips its right edge under the viewport override, so CSS bounds were used to distinguish that capture artifact from page overflow. The override was reset afterward.
