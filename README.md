# Running Hackathon San Francisco

Static San Francisco website, published at https://lukebala4.github.io/runhack-sf/.

GitHub Pages serves the root of the `main` branch. Push changes to `main` to publish. `.nojekyll` preserves the static files without Jekyll processing; there are no build dependencies.

## Local preview

Run `python3 -m http.server 5175 --bind 127.0.0.1` from this repository, then open http://127.0.0.1:5175/.

The home page is `index.html`; press coverage is in `media.html`. Styles are in `website.css` and `media.css`; `website.js` starts the London event film only when the visitor presses Play. Sponsor and contact buttons open editable email drafts and send nothing automatically.

## Assets and deployment scope

The current website and its required assets were copied from the San Francisco mockup on 19 October 2026. The local-only Creative workspace footer link was removed. Historical versions, planning documents, research, private evidence and unused artwork are excluded.

The London film streams from its existing public Vercel Blob URL, so continued playback depends on that external host. It has no supplied accurate caption track.

Geist and the supplied PostHog licence notices are retained in `assets/licenses/`. Sponsor marks and the official Devin mascot belong to their respective owners. The supplied mockup records the adapted PostHog running mascot as not approved for public use and does not establish SF sponsorship agreements. Publishing this copy does not resolve those permissions. Other artwork includes generated or edited images; no new artwork was generated for this deployment. No blanket licence is granted over third-party artwork.
