"""User model with authentication and profile."""
import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)

    # Profile
    role = db.Column(db.String(50), default="member")  # owner, admin, member
    job_title = db.Column(db.String(100), nullable=True)
    company = db.Column(db.String(200), nullable=True)

    # Preferences
    dark_mode = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    slack_webhook = db.Column(db.String(500), nullable=True)
    timezone = db.Column(db.String(50), default="UTC")

    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    email_verified_at = db.Column(db.DateTime, nullable=True)

    # Billing
    stripe_customer_id = db.Column(db.String(100), nullable=True)
    subscription_tier = db.Column(db.String(50), default="free")
    subscription_status = db.Column(db.String(50), default="active")

    # Relations
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)
    team = db.relationship("Team", back_populates="members")
    api_keys = db.relationship("ApiKey", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    alerts = db.relationship("Alert", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)
    last_login_ip = db.Column(db.String(45), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def initials(self):
        return f"{self.first_name[0]}{self.last_name[0]}".upper() if self.first_name and self.last_name else "??"

    @property
    def is_owner(self):
        return self.role == "owner"

    @property
    def is_admin(self):
        return self.role in ("owner", "admin")

    def to_dict(self):
        return {
            "id": self.public_id,
            "email": self.email,
            "name": self.full_name,
            "initials": self.initials,
            "role": self.role,
            "avatar": self.avatar_url,
            "tier": self.subscription_tier,
            "dark_mode": self.dark_mode,
            "timezone": self.timezone,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.email}>"
