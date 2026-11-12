#!/usr/bin/env python3
"""Serve the Warga Films studio site locally:  python3 Website/tools/serve.py [port]

Opens on http://127.0.0.1:8787 by default. The site is plain static files, so
any web server (or static host) can serve the Website folder as it is.
"""
import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".otf": "font/otf", ".woff2": "font/woff2", ".mp3": "audio/mpeg"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and str(args[1])[:1] in "45":
            sys.stderr.write("%s %s\n" % (self.path, args[1]))


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=ROOT))
    print(f"Warga Films studio on http://127.0.0.1:{PORT}", flush=True)
    srv.serve_forever()
