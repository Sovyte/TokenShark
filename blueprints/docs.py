"""Documentation blueprint."""
from flask import Blueprint, render_template

bp = Blueprint("docs", __name__)


@bp.route("/")
def index():
    """Docs landing."""
    return render_template("pages/docs/index.html")


@bp.route("/quickstart")
def quickstart():
    """Quickstart guide."""
    return render_template("pages/docs/quickstart.html")


@bp.route("/sdk/python")
def sdk_python():
    """Python SDK docs."""
    return render_template("pages/docs/sdk_python.html")


@bp.route("/sdk/nodejs")
def sdk_nodejs():
    """Node.js SDK docs."""
    return render_template("pages/docs/sdk_nodejs.html")


@bp.route("/api-reference")
def api_reference():
    """API reference."""
    return render_template("pages/docs/api_reference.html")
