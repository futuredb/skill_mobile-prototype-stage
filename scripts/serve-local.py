"""Serve the prototype and its read-only bundled background gallery on localhost."""
import json
import importlib.util
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SKILL_ROOT = ROOT / 'skills/mobile-prototype-stage-v2'
spec = importlib.util.spec_from_file_location('stage_backgrounds', SKILL_ROOT / 'scripts/backgrounds.py')
backgrounds = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backgrounds)


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/backgrounds':
            images = backgrounds.gallery()
            for image in images:
                image['src'] = '/skills/mobile-prototype-stage-v2/assets/presentation/backgrounds/' + image['src'].split('../presentation/backgrounds/', 1)[1]
            data = json.dumps({'images': images}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

if __name__ == '__main__':
    print('Mobile Stage: http://127.0.0.1:8765/skills/mobile-prototype-stage-v2/assets/starter/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8765), partial(Handler, directory=str(ROOT))).serve_forever()
