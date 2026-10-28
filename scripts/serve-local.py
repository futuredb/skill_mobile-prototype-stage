"""Serve the prototype and its read-only sibling bg-image gallery on localhost."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BACKGROUNDS = ROOT.parent / 'bg-image'
EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'}


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/backgrounds':
            files = sorted((p for p in BACKGROUNDS.iterdir()
                            if p.is_file() and p.suffix.lower() in EXTENSIONS
                            and p.resolve().parent == BACKGROUNDS.resolve()),
                           key=lambda p: p.name.casefold()) if BACKGROUNDS.is_dir() else []
            data = json.dumps({'images': [
                {'id': 'folder-' + p.name, 'label': p.name,
                 'src': '/local-backgrounds/' + quote(p.name, safe='') + '?v=' + str(p.stat().st_mtime_ns)}
                for p in files]}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def translate_path(self, path):
        url_path = urlsplit(path).path
        if url_path.startswith('/local-backgrounds/'):
            name = unquote(url_path[len('/local-backgrounds/'):])
            target = (BACKGROUNDS / name).resolve()
            if (target.parent == BACKGROUNDS.resolve() and
                    target.suffix.lower() in EXTENSIONS and target.is_file()):
                return str(target)
            return str(ROOT / '.missing-background')
        return super().translate_path(path)


if __name__ == '__main__':
    print('Mobile Stage: http://127.0.0.1:8765/skills/mobile-prototype-stage-v2/assets/starter/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8765), partial(Handler, directory=str(ROOT))).serve_forever()
