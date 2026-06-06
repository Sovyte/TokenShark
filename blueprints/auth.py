"""Authentication blueprint."""
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.urls import url_parse

from app import db
from models.user import User
from models.team import Team

bp = Blueprint("auth", __name__)


@bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        first_name = request.form.get("first_name", "").strip()
        last_name = request.form.get("last_name", "").strip()
        company = request.form.get("company", "").strip()

        if not email or not password or not first_name or not last_name:
            flash("All fields are required.", "error")
            return render_template("pages/auth/register.html")

        if len(password) < 8:
            flash("Password must be at least 8 characters.", "error")
            return render_template("pages/auth/register.html")

        if User.query.filter_by(email=email).first():
            flash("An account with this email already exists.", "error")
            return render_template("pages/auth/register.html")

        # Create user
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            company=company,
            role="owner",
        )
        user.set_password(password)

        # Create team
        team = Team(
            name=company or f"{first_name}'s Team",
            slug=email.split("@")[0].replace(".", "-"),
        )

        db.session.add(team)
        db.session.flush()
        user.team_id = team.id
        db.session.add(user)
        db.session.commit()

        login_user(user, remember=True)
        flash("Welcome to TokenShark! Let's set up your first API key.", "success")
        return redirect(url_for("dashboard.onboarding"))

    return render_template("pages/auth/register.html")


@bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        remember = request.form.get("remember", "false").lower() == "true"

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            flash("Invalid email or password.", "error")
            return render_template("pages/auth/login.html")

        if not user.is_active:
            flash("Your account has been deactivated. Contact support.", "error")
            return render_template("pages/auth/login.html")

        login_user(user, remember=remember)
        user.last_login_at = __import__("datetime").datetime.utcnow()
        user.last_login_ip = request.remote_addr
        db.session.commit()

        next_page = request.args.get("next")
        if not next_page or url_parse(next_page).netloc != "":
            next_page = url_for("dashboard.index")

        return redirect(next_page)

    return render_template("pages/auth/login.html")


@bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("main.index"))


@bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        flash("If an account exists, a reset link has been sent.", "info")
        return redirect(url_for("auth.login"))
    return render_template("pages/auth/forgot.html")
