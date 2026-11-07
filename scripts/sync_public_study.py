#!/usr/bin/env python3
"""Publish the approved static study at the existing Pages root, preserving creative/."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import shutil

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', required=True, type=Path)
args = parser.parse_args()
source = args.source.resolve()
root = Path(__file__).resolve().parents[1]
canonical = 'https://lukebala4.github.io/runhack-sf/'
page = (source / 'index.html').read_text()
css = (source / 'study.css').read_text()
js = (source / 'study.js').read_text()
# Collect only referenced assets; never copy evidence, local notes, or other studies.
assets = set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:svg|png|webp|jpe?g|woff2)', page + css + js))
assets.add('assets/london-film-share.jpg')
assets.update(str(p.relative_to(source)) for p in (source/'assets/licenses').rglob('*') if p.is_file())
for relative in sorted(assets):
    original = source / relative
    if not original.is_file():
        raise FileNotFoundError(original)
    target = root / relative.replace('assets/', 'assets/catalogue/', 1)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(original, target)
page = re.sub(r'  <link rel="help"[^>]+>\n', '', page)
up_icon = '<svg class="icon icon--up" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>'
public_footer = f'<div class="footer-links"><a href="#london">Photos {up_icon}</a><a href="#media">Media &amp; Press {up_icon}</a><a href="#top">Back to top {up_icon}</a></div>\n</footer>'
page = re.sub(r'<div class="footer-links">.*?</div>\s*\n</footer>', public_footer, page, flags=re.S)
page = page.replace('assets/', 'assets/catalogue/')
css = css.replace('assets/', 'assets/catalogue/')
version = hashlib.sha256((css+js).encode()).hexdigest()[:12]
page = re.sub(r'(study\.(?:css|js)\?v=)[^\"]+', rf'\g<1>{version}', page)
metadata = f'''  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Running Hackathon · Build on the move">
  <meta property="og:description" content="Run together. Build with AI. Explore the Running Hackathon and help bring the next one to San Francisco.">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{canonical}assets/catalogue/london-film-share.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:image:alt" content="The London Running Hackathon track, as shown in the event film.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="{canonical}assets/catalogue/london-film-share.jpg">
'''
page = page.replace('</head>', metadata+'</head>')
(root/'index.html').write_text(page)
(root/'study.css').write_text(css)
(root/'study.js').write_text(js)
(root/'media.html').write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Running Hackathon · Media &amp; Press</title><link rel="canonical" href="{canonical}"><meta http-equiv="refresh" content="0;url=./#media"></head><body><p><a href="./#media">View Running Hackathon media and press</a></p></body></html>
''')
outputs = ['index.html','study.css','study.js','media.html'] + [r.replace('assets/','assets/catalogue/',1) for r in sorted(assets)]
manifest = {'canonical':canonical,'source_study':source.name,'asset_count':len(assets),'files':{r:hashlib.sha256((root/r).read_bytes()).hexdigest() for r in outputs}}
(root/'publication-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
assert 'creative/' not in page and '127.0.0.1' not in page and 'Versions' not in page
print(f'Prepared {len(outputs)} public files at the existing Pages root.')
