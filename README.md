# Running Hackathon San Francisco

Static San Francisco website, published at https://lukebala4.github.io/runhack-sf/.

GitHub Pages serves the root of the `main` branch. Push changes to `main` to publish. `.nojekyll` preserves the static files without Jekyll processing; there are no build dependencies.

## Local preview

Run `python3 -m http.server 5175 --bind 127.0.0.1` from this repository, then open http://127.0.0.1:5175/.

The home page is `index.html`, styled by `study.css`, with inline video, the explorable twelve-photo catalogue and mascot interactions in `study.js`. Press coverage is part of the home page; `media.html` redirects old links to `/#media`. Sponsor and contact buttons open editable email drafts and send nothing automatically.

## One public website

Use **https://lukebala4.github.io/runhack-sf/** as the canonical shareable link. GitHub Pages still serves only `main` at `/`; deployment records are revisions of this same site. The home page does not expose internal version selectors. Existing `creative/` routes are preserved historical studies, not separate deployments.

To update only the public home page from the approved local study:

```sh
python3 scripts/sync_public_study.py --source '/path/to/Runninghack SF Planning/24 Meadow Lilac'
node --check study.js
```

This copies referenced assets and licence files into `assets/catalogue/`, strips internal workspace links, adds share metadata, and writes `publication-manifest.json` with file hashes. It preserves the Creative Warehouse, original shared assets and unrelated files. Review the changes, verify desktop and phone behavior, then push the scoped commit to `main`.

## Archived creative workspace

`creative/` is a generated static export. Its `export-manifest.json` records the complete source-file set and SHA-256 hashes. The exporter follows the catalog, page links, styles, scripts and data references; it rewrites localhost and planning-root URLs for `/runhack-sf/creative/`, resolves shared symlink assets to canonical files, retains licence notices, and generates browsable directory pages where the local Python server previously provided listings. Authoring scripts, hidden files and unrelated local files are excluded. Source studies are preserved unchanged.

To refresh the shared workspace from the local authoring collection, run:

```sh
python3 scripts/export_creative_workspace.py --source '/path/to/Runninghack SF Planning'
```

Review and commit the resulting `creative/` changes, then push `main`. Publishing does not synchronise edits back to the local planning collection.

The London film streams from its existing public Vercel Blob URL, so continued playback depends on that external host. It has no supplied accurate caption track.

Geist and the supplied PostHog licence notices are retained in `assets/licenses/`. Sponsor marks and the official Devin mascot belong to their respective owners. The supplied mockup records the adapted PostHog running mascot as not approved for public use and does not establish SF sponsorship agreements. Publishing this copy does not resolve those permissions. Other artwork includes generated or edited images; no new artwork was generated for this deployment. No blanket licence is granted over third-party artwork.
