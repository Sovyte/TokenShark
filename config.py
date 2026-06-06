"""
TokenShark Configuration & Secrets
==================================
All environment variables, secrets, and configurable constants.
NEVER commit the .env file. This module loads from environment
with sensible defaults for local development.
"""
import os
import warnings
from datetime import timedelta

# ── Base Paths ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Flask Core ──────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
FLASK_ENV = os.getenv("FLASK_ENV", "development")
DEBUG = FLASK_ENV == "development"
TESTING = os.getenv("TESTING", "false").lower() == "true"

# Warn loudly if using the default secret key in production
if not DEBUG and SECRET_KEY == "dev-secret-change-in-production":
    warnings.warn(
        "SECRET_KEY is set to the development default. "
        "Set the SECRET_KEY environment variable before deploying.",
        RuntimeWarning,
        stacklevel=2,
    )

# ── Server ──────────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 5000))  # Render injects PORT automatically
THREADED = True
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# ── Database ────────────────────────────────────────────────
# Render (and Heroku) issue DATABASE_URL with the legacy "postgres://" scheme.
# SQLAlchemy 2.x only accepts "postgresql://". Fix it transparently here.
_raw_db_url = os.getenv(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(BASE_DIR, "tokenshark.db"),
)
SQLALCHEMY_DATABASE_URI = _raw_db_url.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,   # Detect stale connections before use
    "pool_recycle": 300,     # Recycle connections every 5 min (important on Render)
    # On Render's free PostgreSQL the max_connections is 25;
    # keep the pool small so multiple gunicorn workers don't exhaust it.
    "pool_size": 5,
    "max_overflow": 10,
}

# ── Redis (for caching, sessions, real-time) ─────────────────
REDIS_URL = os.getenv("REDIS_URL", "")  # Empty string → memory fallback below

# ── Security ────────────────────────────────────────────────
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
PERMANENT_SESSION_LIFETIME = timedelta(days=7)
BCRYPT_LOG_ROUNDS = 12 if not DEBUG else 4

# ── CORS ────────────────────────────────────────────────────
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5000,http://127.0.0.1:5000",
).split(",")

# ── Rate Limiting ───────────────────────────────────────────
# Use Redis when available; fall back to in-memory so the app starts
# cleanly on Render's free tier (no Redis add-on).
RATELIMIT_STORAGE_URI = REDIS_URL if REDIS_URL else "memory://"
RATELIMIT_STRATEGY = "fixed-window"
RATELIMIT_DEFAULT = "200 per minute"

# ── Mail ────────────────────────────────────────────────────
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "hello@tokenshark.io")

# ── Analytics & Tracking ────────────────────────────────────
HOTJAR_ID = os.getenv("HOTJAR_ID", "b2257f9644276")
HOTJAR_SCRIPT = f"https://t.contentsquare.net/uxa/{HOTJAR_ID}.js"
GOOGLE_ANALYTICS_ID = os.getenv("GOOGLE_ANALYTICS_ID", "")
POSTHOG_API_KEY = os.getenv("POSTHOG_API_KEY", "")

# ── Stripe ──────────────────────────────────────────────────
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# ── Pricing Tiers ───────────────────────────────────────────
PRICING = {
    "free": {
        "name": "Starter",
        "price": 0,
        "requests": 10_000,
        "seats": 1,
        "retention_days": 7,
        "features": [
            "10K requests/month",
            "1 team member",
            "7-day data retention",
            "Basic cost dashboard",
            "Email support",
        ],
    },
    "team": {
        "name": "Team",
        "price": 49,
        "requests": 1_000_000,
        "seats": 10,
        "retention_days": 30,
        "features": [
            "1M requests/month",
            "10 team members",
            "30-day data retention",
            "Advanced analytics",
            "Budget alerts",
            "Slack integration",
            "Priority support",
        ],
    },
    "business": {
        "name": "Business",
        "price": 199,
        "requests": 10_000_000,
        "seats": 50,
        "retention_days": 90,
        "features": [
            "10M requests/month",
            "50 team members",
            "90-day data retention",
            "Prompt versioning",
            "Regression detection",
            "Custom dashboards",
            "SSO (SAML/OIDC)",
            "Dedicated support",
        ],
    },
    "enterprise": {
        "name": "Enterprise",
        "price": None,
        "requests": float("inf"),
        "seats": float("inf"),
        "retention_days": 365,
        "features": [
            "Unlimited requests",
            "Unlimited seats",
            "1-year retention",
            "On-premise deployment",
            "SOC2 / HIPAA compliance",
            "Custom contracts",
            "99.9% SLA",
            "White-glove onboarding",
        ],
    },
}

# ── Brand ───────────────────────────────────────────────────
BRAND_NAME = "TokenShark"
BRAND_TAGLINE = "Datadog for LLM Applications"
BRAND_DOMAIN = os.getenv("BRAND_DOMAIN", "tokenshark.io")
BRAND_EMAIL = "hello@tokenshark.io"
BRAND_TWITTER = "@tokenshark"
BRAND_GITHUB = "github.com/tokenshark"
BRAND_DISCORD = "discord.gg/tokenshark"

# ── Colors (CSS Custom Properties reference) ──────────────────
COLORS = {
    "black": {
        "900": "#0a0a0a",
        "800": "#111111",
        "700": "#1a1a1a",
        "600": "#222222",
        "500": "#2a2a2a",
        "400": "#333333",
        "300": "#444444",
        "200": "#666666",
        "100": "#888888",
    },
    "white": {
        "100": "#ffffff",
        "200": "#fafafa",
        "300": "#f5f5f5",
        "400": "#eeeeee",
        "500": "#e0e0e0",
    },
    "rosewater": {
        "50": "#fdf8f7",
        "100": "#f4e4e1",
        "200": "#e8c4c0",
        "300": "#d4a5a0",
        "400": "#c08a85",
        "500": "#a6706b",
        "600": "#8a5a56",
        "700": "#6e4542",
        "800": "#52302e",
        "900": "#361c1b",
    },
    "accent": {
        "success": "#22c55e",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6",
    },
}

# ── Typography ──────────────────────────────────────────────
FONTS = {
    "mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
    "sans": "'Inter', 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    "display": "'Space Grotesk', 'Inter', sans-serif",
}

# ── Feature Flags ───────────────────────────────────────────
FEATURES = {
    "dark_mode_default": True,
    "enable_signups": True,
    "enable_billing": False,
    "enable_sso": False,
    "enable_ai_insights": False,
    "enable_realtime": True,
    "enable_command_palette": True,
    "enable_keyboard_shortcuts": True,
    "enable_tour": True,
    "enable_notifications": True,
}

# ── API Limits ──────────────────────────────────────────────
API_RATE_LIMITS = {
    "ingest": "10,000 per minute",
    "query": "1,000 per minute",
    "export": "100 per hour",
}

# ── Logging ───────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

# ── Health Check ────────────────────────────────────────────
HEALTH_CHECK_ENDPOINT = "/health"
