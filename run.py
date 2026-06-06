#!/usr/bin/env python3
"""
TokenShark — Development Entry Point
=====================================
Use this file for LOCAL development only.

Production (Render / any WSGI host):
  gunicorn "app:create_app()" --bind "0.0.0.0:$PORT" --workers 2 --threads 2
"""
import os
import sys

if os.getenv("FLASK_ENV", "development") == "production":
    print(
        "ERROR: run.py is for local development only.\n"
        "On Render, the start command should be:\n"
        '  gunicorn "app:create_app()" --bind "0.0.0.0:$PORT" --workers 2 --threads 2',
        file=sys.stderr,
    )
    sys.exit(1)

from app import create_app
import config

app = create_app(config)

if __name__ == "__main__":
    print(f"""
    ╔══════════════════════════════════════════╗
    ║                                          ║
    ║     🦈  TokenShark is running!           ║
    ║                                          ║
    ║     http://localhost:{config.PORT:<5}              ║
    ║                                          ║
    ╚══════════════════════════════════════════╝
    """)
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG,
        threaded=config.THREADED,
    )
