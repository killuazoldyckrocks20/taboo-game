#!/usr/bin/env python3
"""
Simple HTTP Server for Taboo Game Webapp
Runs on port 8000 and serves static files with proper MIME types.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable caching-free testing
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"🎉 Taboo Game Server running at: {url}")
        print(f"📁 Serving directory: {DIRECTORY}")
        print("Press Ctrl+C to stop the server.")
        
        # Try to open browser automatically if interactive
        try:
            if "--open" in sys.argv:
                webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
