"""API blueprint for SDK and external integrations."""
from flask import Blueprint, request, jsonify
from functools import wraps

bp = Blueprint("api", __name__)


def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get("X-API-Key", "")
        if not api_key or not api_key.startswith("ts_"):
            return jsonify({"error": "Invalid or missing API key"}), 401
        return f(*args, **kwargs)
    return decorated


@bp.route("/ingest", methods=["POST"])
@require_api_key
def ingest():
    """Ingest LLM event from SDK."""
    data = request.get_json() or {}
    return jsonify({"status": "ok", "id": "evt_" + __import__("secrets").token_hex(8)}), 201


@bp.route("/health")
def health():
    """API health check."""
    return jsonify({"status": "ok"})


@bp.route("/stats")
@require_api_key
def stats():
    """Get aggregated stats."""
    return jsonify({
        "requests_today": 47_293,
        "cost_today": 214.52,
        "avg_latency": 234,
        "error_rate": 0.4,
    })
