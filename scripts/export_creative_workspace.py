#!/usr/bin/env python3
"""Export the complete linked creative collection as a self-contained Pages site.

Run: python3 scripts/export_creative_workspace.py --source '/path/to/Runninghack SF Planning'
Original studies are never modified. Only files reachable from the dashboard,
catalog, linked pages and their resources are included. Symlinked resources are
resolved and linked to their canonical copy; Python tools and hidden files stay local.
"""
from __future__ import annotations

import argparse
from collections import deque
import hashlib
from html import escape, unescape
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
from urllib.parse import quote, unquote, urlsplit, urlunsplit

REPO = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = '/runhack-sf/creative/'
HOME = '/runhack-sf/'
TEXT = {'.html', '.css', '.js', '.mjs', '.json', '.svg', '.md', '.txt'}
SAFE = TEXT | {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.woff2', '.woff', '.ttf', '.wasm', '.riv', '.rev', '.mp4', '.webm', '.pdf'}
QUOTED = re.compile(r'''(["'`])([^"'`\r\n<>]{1,1400})\1''')
CSS_URL = re.compile(r'url\(\s*([\'"]?)([^\)\r\n]+?)\1\s*\)')
LOCALHOST = re.compile(r'https?://(?:127\.0\.0\.1|localhost):(5173|5174|5175)(?=[/?#\s"\'<>]|$)')
SECRET = re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{25,}|\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}')


class Attributes(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if value and key in {'src', 'href', 'poster', 'xlink:href', 'data-src'}:
                self.refs.append(value)
            elif value and key == 'srcset':
                self.refs.extend(x.strip().split()[0] for x in value.split(',') if x.strip())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    args = parser.parse_args()
    source = args.source.resolve()
    dashboard = source / '04 Creative Warehouse'
    catalog = json.loads((dashboard / 'catalog.json').read_text())
    out = REPO / 'creative'
    stage = REPO / '.creative-export-stage'
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir()
    queue = deque([dashboard / 'index.html', dashboard / 'catalog.json'])
    # Redistributed fonts and vendor runtimes retain their supplied licence notices.
    queue.extend(p for p in source.rglob('*') if p.is_file() and p.suffix.lower() in TEXT and any(word in p.name.lower() for word in ('license', 'licence', 'copying')))
    seen, directories, manifest, missing = set(), {}, [], set()

    def permitted(path):
        try:
            rel = path.relative_to(source)
        except ValueError:
            return False
        return not any(x.startswith('.') or x in {'scripts', '__pycache__'} for x in rel.parts) and path.name != 'AGENTS.md' and path.suffix.lower() in SAFE

    def local_target(raw, current):
        raw = unescape(raw.strip())
        if not raw or len(raw) > 1500 or '\n' in raw or raw.startswith(('#', 'data:', 'mailto:', 'tel:', 'javascript:')) or '${' in raw:
            return None
        try:
            u = urlsplit(raw)
        except ValueError:
            return None
        if u.scheme or u.netloc:
            return None
        if not u.path:
            return None
        p = unquote(u.path)
        if any(len(part.encode('utf-8')) > 255 for part in p.split('/')):
            return None
        if p.startswith(PUBLIC_ROOT):
            lexical = source / p[len(PUBLIC_ROOT):]
        elif p.startswith(HOME):
            return None
        elif p.startswith('/'):
            lexical = source / p.lstrip('/')
        else:
            lexical = current.parent / p
        lexical = Path(os.path.normpath(lexical))
        resolved = lexical.resolve()
        try:
            resolved.relative_to(source)
        except ValueError:
            return None
        return lexical, resolved, u

    def register(raw, current, strict=False):
        target = local_target(raw, current)
        if not target:
            return raw
        lexical, resolved, u = target
        if resolved.is_dir():
            if (resolved / 'index.html').exists():
                queue.append(resolved / 'index.html')
            else:
                if resolved not in directories:
                    entries = []
                    directories[resolved] = entries
                    for p in sorted(resolved.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                        if p.name.startswith('.') or p.name in {'scripts', '__pycache__', 'AGENTS.md'}:
                            continue
                        if p.is_dir():
                            # The linked process folder remains browsable on Pages.
                            entries.append(p)
                            register(p.name + '/', resolved / 'index.html', strict=True)
                        elif permitted(p.resolve()):
                            entries.append(p)
                            queue.append(p.resolve())
                    directories[resolved] = entries
            if lexical != resolved:
                p = quote(os.path.relpath(resolved, current.parent), safe='/') + '/'
                return urlunsplit(('', '', p, u.query, u.fragment))
            return raw
        if resolved.is_file() and permitted(resolved):
            queue.append(resolved)
            if lexical != resolved:
                p = quote(os.path.relpath(resolved, current.parent), safe='/')
                return urlunsplit(('', '', p, u.query, u.fragment))
        elif strict and not resolved.exists():
            missing.add((str(current.relative_to(source)), raw))
        return raw

    def adapt(text, current):
        # Convert localhost and root-relative study links in exported copies only.
        text = LOCALHOST.sub(lambda m: HOME.rstrip('/') if m[1] in {'5174', '5175'} else PUBLIC_ROOT.rstrip('/'), text)
        text = re.sub(r'''(["'`])/((?:0[13456789]|1\d|2[0-3])(?:%20| )[^"'`\r\n<>]*)''', lambda m: m[1] + PUBLIC_ROOT + m[2], text)
        if current.suffix == '.html':
            attrs = Attributes()
            attrs.feed(text)
            for ref in attrs.refs:
                register(ref, current, strict=True)
        def quoted(m):
            raw = m[2]
            # Only resource-looking strings, not snippets or ordinary prose.
            if any(x in raw for x in ('{', '}', '\\n')) or len(raw) > 800:
                return m[0]
            if raw.split('?')[0].split('#')[0].lower().endswith(tuple(SAFE)) or raw.startswith(('./', '../', PUBLIC_ROOT)):
                value = register(raw, current)
                return m[1] + value + m[1]
            return m[0]
        text = QUOTED.sub(quoted, text)
        def css_url(m):
            value = register(m[2].strip('\'"'), current, strict=True)
            return 'url(' + m[1] + value + m[1] + ')'
        text = CSS_URL.sub(css_url, text)
        if current.suffix == '.json':
            try:
                obj = json.loads(text)
            except ValueError:
                obj = None
            def walk(obj):
                if isinstance(obj, dict):
                    for v in obj.values(): walk(v)
                elif isinstance(obj, list):
                    for v in obj: walk(v)
                elif isinstance(obj, str):
                    register(obj, current)
            walk(obj)
        if current == dashboard / 'guide.html':
            text = text.replace('Serve it on localhost to use the dashboard.', 'The shared export is hosted on GitHub Pages; the original local workspace remains the authoring source.')
        if SECRET.search(text):
            raise RuntimeError(f'Possible credential in {current.relative_to(source)}; export stopped')
        return text

    try:
        while queue:
            p = queue.popleft().resolve()
            if p in seen:
                continue
            if not permitted(p):
                continue
            seen.add(p)
            rel = p.relative_to(source)
            target = stage / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            original = p.read_bytes()
            if p.suffix.lower() in TEXT:
                content = adapt(original.decode('utf-8'), p).encode('utf-8')
                target.write_bytes(content)
            else:
                content = original
                target.write_bytes(content)
            manifest.append({'path': rel.as_posix(), 'bytes': len(content), 'source_sha256': hashlib.sha256(original).hexdigest(), 'sha256': hashlib.sha256(content).hexdigest()})
        for directory, entries in directories.items():
            rel = directory.relative_to(source)
            target = stage / rel / 'index.html'
            target.parent.mkdir(parents=True, exist_ok=True)
            cards = ''.join(f'<li><a href="{quote(p.name, safe="")}{"/" if p.is_dir() else ""}">{escape(p.name)}{"/" if p.is_dir() else ""}</a></li>' for p in entries)
            target.write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Creative process files</title><style>body{font:18px/1.6 system-ui;max-width:900px;margin:40px auto;padding:20px;background:#f7f7f1;color:#252923}a{color:inherit}li{margin:10px 0}</style><a href="'+PUBLIC_ROOT+'04%20Creative%20Warehouse/">← Creative workspace</a><h1>'+escape(rel.name)+'</h1><ul>'+cards+'</ul></html>')
        if missing:
            raise RuntimeError('Missing explicit page resources: ' + json.dumps(sorted(missing), indent=2))
        # Verify every catalog action, secondary action and preview survives export.
        for item in catalog['items']:
            for raw in [item.get('href', ''), item.get('image', ''), item.get('secondary', {}).get('href', '')]:
                target = local_target(raw, dashboard / 'index.html')
                if target:
                    _, resolved, _ = target
                    exported = stage / resolved.relative_to(source)
                    if exported.is_dir(): exported /= 'index.html'
                    if not exported.is_file():
                        raise RuntimeError(f'Catalog item {item["id"]} not exported: {raw}')
        (stage / 'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Creative workspace</title><meta http-equiv="refresh" content="0;url=04%20Creative%20Warehouse/"><script>location.replace("04%20Creative%20Warehouse/"+location.search+location.hash)</script><a href="04%20Creative%20Warehouse/">Open Creative workspace</a></html>')
        summary = {'schemaVersion': 1, 'studies': len(catalog['items']), 'rounds': len(catalog['rounds']), 'files': sorted(manifest, key=lambda x:x['path']), 'generated_directory_indexes': sorted(str(p.relative_to(source)) for p in directories), 'total_bytes': sum(p.stat().st_size for p in stage.rglob('*') if p.is_file())}
        (stage / 'export-manifest.json').write_text(json.dumps(summary, indent=2) + '\n')
        if out.exists(): shutil.rmtree(out)
        stage.rename(out)
        print(json.dumps({k:v for k,v in summary.items() if k not in {'files'}}, indent=2))
        print(f'Exported {len(manifest)} source files and all {len(catalog["items"])} studies to {out}')
    except Exception:
        shutil.rmtree(stage, ignore_errors=True)
        raise


if __name__ == '__main__':
    main()
