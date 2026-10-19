# Running Hackathon creative warehouse

Open [the dashboard](/runhack-sf/creative/04%20Creative%20Warehouse/) or the local server root. This is the home for the ongoing exploration, with all directions available together.

The initial catalog has 41 studies, including 12 complete website versions across three rounds. The 30 Pinterest pins remain accessible through their full gallery. The image library includes all eight generated photographic masters, the clean original track, illustrations and approved logos. Motion, Rive source/export files, research, exact prompts and historical screenshots are linked too.

## Keep rounds intact

- `catalog.json` is the editable dashboard registry. Stable item IDs also identify local favourites.
- `iterations/<round-id>/` contains independent saved HTML, JS and CSS. Do not edit these files after saving.
- `asset-sets/<sha256>/assets/` contains independent copies of the source assets. Unchanged assets are shared between rounds, not re-copied each time. Each round has a relative `assets` symlink to its frozen set. Do not edit asset sets.
- `thumbnails/` holds fast visual previews. Existing thumbnails are never replaced by the bootstrap.
- `notes/` contains readable snapshots of the original briefs and prompt documentation. Original Markdown and all process files remain in their original folders.

Before revising the active concepts, save the current state using a unique descriptive ID:

```sh
python3 '04 Creative Warehouse/scripts/save-iteration.py' \
  --id 2026-10-17-type-exploration \
  --title 'Type exploration' \
  --description 'The direction before the next typography pass.'
```

Run from the `Runninghack SF Planning` directory. The script freezes all exported hybrid concepts, discovers their IDs/names/images, records SHA-256 manifests, and adds the new round to the top of the dashboard. It refuses duplicate IDs, verifies any reused asset set and serializes saves with a local file lock. A catalog write error rolls back only the newly created round, so the same ID can be retried. The unchanged frozen asset set may remain for reuse.

The script assumes the existing static concept module format (`id`, `name`, `image` in the exported metadata). If the concept architecture or route model changes, update the snapshot utility at the same time. Include any new local modules in `CODE` and add non-website explorations to `catalog.json`. Avoid silently saving only part of a new design system.

## History boundary

The first merged headlines had already been changed in the live files. They were restored from the retained screenshots and the retained layout source, and are explicitly marked `restored: true`. They are usable recreations of that earlier wording, not an assertion of a byte-exact earlier source revision. From this point forward saved rounds contain exact code and asset manifests.

Historical screenshots can contain superseded copy and branding. They are available as process records, not used as the current identity. All current concepts and dashboard branding use the approved stacked Running Hackathon logo.

Favourites use localStorage and belong to the current browser. The catalog, snapshots and assets are filesystem-backed; no accounts, cloud service or database are required. This is a manually registered local collection, not a background watcher: add each future round with the save command. No production site was deployed.

Keep the whole planning folder together so relative links and symlinks continue to work. The server must serve `Runninghack SF Planning` as its root:

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory '/Users/lukebalabanovic/Running/Runninghack SF Planning'
```

## Initial bootstrap

`scripts/build-initial-collection.py` was used once to restore the first three rounds, make WebP thumbnails and build the initial catalog. It needs Pillow, already available in this workspace. Normal snapshot saves use only the Python standard library. Use the save command for new rounds; do not use the bootstrap as a routine refresh.
