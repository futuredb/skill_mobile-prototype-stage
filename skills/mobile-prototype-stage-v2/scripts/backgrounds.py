"""Sync all bundled backgrounds; optionally serve a live folder gallery."""
import argparse
import json
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'}


def gallery(root=ROOT):
    folder = root / 'assets/presentation/backgrounds'
    files = [p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS
             and p.resolve().is_relative_to(folder.resolve())]
    files.sort(key=lambda p: [int(v) if v.isdigit() else v.casefold()
                             for v in re.split(r'(\d+)', p.relative_to(folder).as_posix())])
    return [{'id': 'folder-' + p.relative_to(folder).as_posix(), 'label': p.stem,
             'src': '../presentation/backgrounds/' + quote(p.relative_to(folder).as_posix())
                    + '?v=' + str(p.stat().st_mtime_ns)} for p in files]


def sync(root=ROOT):
    images = gallery(root)
    page = root / 'assets/starter/index.html'
    source, count = re.subn(r'const backgroundPresets=\[.*?\];',
                           lambda _: 'const backgroundPresets=' + json.dumps(images, ensure_ascii=False).replace('<', '\\u003c') + ';',
                           page.read_text(), count=1)
    if count != 1:
        raise ValueError('Starter gallery declaration missing')
    page.write_text(source)
    path = root / 'assets/starter/defaults.json'
    defaults = json.loads(path.read_text())
    defaults['background']['gallery'] = images
    if defaults['background']['image']['preset'] not in {p['id'] for p in images}:
        defaults['background']['image']['preset'] = images[0]['id'] if images else ''
    path.write_text(json.dumps(defaults, ensure_ascii=False, indent=2) + '\n')
    return images


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path != '/api/backgrounds':
            return super().do_GET()
        data = json.dumps({'images': gallery()}, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--serve', action='store_true')
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    print(f'Synced {len(sync())} backgrounds', flush=True)
    if args.serve:
        print(f'http://127.0.0.1:{args.port}/assets/starter/', flush=True)
        ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(ROOT))).serve_forever()
