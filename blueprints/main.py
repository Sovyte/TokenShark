"""Public pages blueprint."""
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import current_user

bp = Blueprint("main", __name__)


@bp.route("/")
def index():
    """Landing page."""
    return render_template("pages/landing.html")


@bp.route("/features")
def features():
    """Features page."""
    return render_template("pages/features.html")


@bp.route("/pricing")
def pricing():
    """Pricing page."""
    return render_template("pages/pricing.html")


@bp.route("/about")
def about():
    """About page."""
    return render_template("pages/about.html")


@bp.route("/contact", methods=["GET", "POST"])
def contact():
    """Contact page."""
    if request.method == "POST":
        flash("Message sent! We'll get back to you within 24 hours.", "success")
        return redirect(url_for("main.contact"))
    return render_template("pages/contact.html")


@bp.route("/toggle-theme", methods=["POST"])
def toggle_theme():
    """Toggle dark/light mode."""
    session["dark_mode"] = not session.get("dark_mode", True)
    return redirect(request.referrer or url_for("main.index"))
