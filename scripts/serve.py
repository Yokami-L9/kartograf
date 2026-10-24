"""Optional localhost launcher using only the Python standard library."""
from pathlib import Path
import argparse,http.server,threading,webbrowser,runpy
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=5173);p.add_argument('--open',action='store_true');args=p.parse_args()
# Build from the version-controlled source files, not stale generated output.
runpy.run_path(str(ROOT/'build.py'))
class Handler(http.server.BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path.split('?')[0] not in ('/','/index.html'):
   self.send_error(404);return
  body=(ROOT/'index.html').read_bytes();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
try: server=http.server.ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
except OSError as e: raise SystemExit(f'Cannot start localhost:{args.port}: {e}. Choose another port with --port 5174.')
url=f'http://localhost:{server.server_port}';print(f'\nКартограф\n{url}\nОстановить: Control+C\n',flush=True)
if args.open:threading.Timer(.5,lambda:webbrowser.open(url)).start()
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
