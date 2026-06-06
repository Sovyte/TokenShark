"""Billing & subscription blueprint."""
from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_required, current_user

bp = Blueprint("billing", __name__)


@bp.route("/")
@login_required
def index():
    """Billing overview."""
    return render_template("pages/billing/index.html")


@bp.route("/upgrade")
@login_required
def upgrade():
    """Upgrade plan."""
    return render_template("pages/billing/upgrade.html")


@bp.route("/invoices")
@login_required
def invoices():
    """Invoice history."""
    return render_template("pages/billing/invoices.html")
