"""
TokenShark — LLM Observability Platform
Main application factory and bootstrap.
"""
import os
import logging
from datetime import datetime

from flask import Flask, render_template, request, g, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

import config

# ── Extensions (initialized in factory) ─────────────────────
db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()
mail = Mail()
limiter = Limiter(key_func=get_remote_address)
cors = CORS()


def create_app(config_obj=config):
    """Application factory pattern."""
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
        static_url_path="/static",
    )
    app.config.from_object(config_obj)

    # ── Logging ─────────────────────────────────────────────
    logging.basicConfig(
        level=getattr(logging, config_obj.LOG_LEVEL),
        format=config_obj.LOG_FORMAT,
    )
    app.logger.setLevel(getattr(logging, config_obj.LOG_LEVEL))

    # ── Extensions Init ─────────────────────────────────────
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    limiter.init_app(app)
    cors.init_app(app, origins=config_obj.CORS_ORIGINS)

    # ── Login Config ────────────────────────────────────────
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"

    # ── Security Headers ────────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
            "magnetometer=(), microphone=(), payment=(), usb=()"
        )
        if not config_obj.DEBUG:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )
        return response

    # ── Request Context ─────────────────────────────────────
    @app.before_request
    def before_request():
        g.now = datetime.utcnow()
        g.config = config_obj
        g.year = datetime.utcnow().year
        # Dark mode preference
        if "dark_mode" not in session:
            session["dark_mode"] = config_obj.FEATURES["dark_mode_default"]

    # ── Template Globals ────────────────────────────────────
    @app.context_processor
    def inject_globals():
        return {
            "brand": config_obj.BRAND_NAME,
            "tagline": config_obj.BRAND_TAGLINE,
            "domain": config_obj.BRAND_DOMAIN,
            "colors": config_obj.COLORS,
            "fonts": config_obj.FONTS,
            "pricing": config_obj.PRICING,
            "features": config_obj.FEATURES,
            "hotjar_script": config_obj.HOTJAR_SCRIPT,
            "ga_id": config_obj.GOOGLE_ANALYTICS_ID,
            "posthog_key": config_obj.POSTHOG_API_KEY,
            "year": datetime.utcnow().year,
            "dark_mode": session.get("dark_mode", True),
        }

    # ── Error Handlers ──────────────────────────────────────
    @app.errorhandler(404)
    def not_found(error):
        return render_template("pages/error.html", code=404, title="Not Found"), 404

    @app.errorhandler(500)
    def server_error(error):
        app.logger.error(f"Server error: {error}")
        return render_template("pages/error.html", code=500, title="Server Error"), 500

    @app.errorhandler(429)
    def rate_limit(error):
        return render_template("pages/error.html", code=429, title="Too Many Requests"), 429

    # ── Blueprint Registration ──────────────────────────────
    from blueprints.main import bp as main_bp
    from blueprints.auth import bp as auth_bp
    from blueprints.dashboard import bp as dashboard_bp
    from blueprints.api import bp as api_bp
    from blueprints.billing import bp as billing_bp
    from blueprints.docs import bp as docs_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")
    app.register_blueprint(api_bp, url_prefix="/api/v1")
    app.register_blueprint(billing_bp, url_prefix="/billing")
    app.register_blueprint(docs_bp, url_prefix="/docs")

    # ── Health Check ────────────────────────────────────────
    @app.route(config_obj.HEALTH_CHECK_ENDPOINT)
    def health():
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}, 200

    # ── Database Init ───────────────────────────────────────
    # Run db.create_all() in both dev and production so that the schema
    # exists on first deploy. For long-term migrations use Flask-Migrate
    # (flask db upgrade) as the build/release command on Render instead.
    with app.app_context():
        try:
            db.create_all()
        except Exception as exc:
            app.logger.warning(f"db.create_all() skipped: {exc}")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
