"""Dashboard blueprint."""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func

from app import db
from models.llm_event import LlmEvent
from models.api_key import ApiKey
from models.alert import Alert

bp = Blueprint("dashboard", __name__)


@bp.route("/")
@login_required
def index():
    """Main dashboard."""
    # Mock stats for demo
    stats = {
        "total_requests": 2_847_392,
        "total_cost": 12_847.53,
        "avg_latency": 245,
        "error_rate": 0.42,
        "requests_change": 12.5,
        "cost_change": 8.3,
        "latency_change": -5.2,
        "error_change": -0.1,
    }

    # Recent events (mock)
    recent_events = [
        {"id": "evt_1", "provider": "openai", "model": "gpt-4o", "tokens": 1243, "cost": 0.0124, "latency": 234, "status": "success", "feature": "chat", "time": "2 min ago"},
        {"id": "evt_2", "provider": "anthropic", "model": "claude-3-sonnet", "tokens": 892, "cost": 0.0089, "latency": 189, "status": "success", "feature": "summarize", "time": "3 min ago"},
        {"id": "evt_3", "provider": "openai", "model": "gpt-3.5-turbo", "tokens": 456, "cost": 0.0009, "latency": 89, "status": "error", "feature": "classify", "time": "5 min ago"},
        {"id": "evt_4", "provider": "mistral", "model": "mistral-large", "tokens": 2100, "cost": 0.0042, "latency": 312, "status": "success", "feature": "generate", "time": "7 min ago"},
        {"id": "evt_5", "provider": "openai", "model": "gpt-4o", "tokens": 567, "cost": 0.0057, "latency": 156, "status": "success", "feature": "chat", "time": "8 min ago"},
    ]

    # Alerts (mock)
    alerts = [
        {"id": "alt_1", "title": "Cost spike detected", "message": "Daily spend exceeded $450 (threshold: $400)", "severity": "warning", "time": "15 min ago", "read": False},
        {"id": "alt_2", "title": "High latency on gpt-4o", "message": "p95 latency jumped to 890ms", "severity": "error", "time": "1 hr ago", "read": False},
        {"id": "alt_3", "title": "New team member joined", "message": "sarah@acme.com accepted invitation", "severity": "info", "time": "3 hr ago", "read": True},
    ]

    return render_template("pages/dashboard/index.html", stats=stats, events=recent_events, alerts=alerts)


@bp.route("/onboarding")
@login_required
def onboarding():
    """First-time onboarding."""
    return render_template("pages/dashboard/onboarding.html")


@bp.route("/events")
@login_required
def events():
    """Events log page."""
    return render_template("pages/dashboard/events.html")


@bp.route("/analytics")
@login_required
def analytics():
    """Advanced analytics page."""
    return render_template("pages/dashboard/analytics.html")


@bp.route("/settings")
@login_required
def settings():
    """Settings page."""
    return render_template("pages/dashboard/settings.html")


@bp.route("/api-keys")
@login_required
def api_keys():
    """API key management."""
    keys = ApiKey.query.filter_by(team_id=current_user.team_id).all() if current_user.team else []
    return render_template("pages/dashboard/api_keys.html", keys=keys)


@bp.route("/team")
@login_required
def team():
    """Team management."""
    return render_template("pages/dashboard/team.html")


@bp.route("/alerts")
@login_required
def alerts():
    """Alerts page."""
    return render_template("pages/dashboard/alerts.html")
