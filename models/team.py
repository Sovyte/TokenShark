"""Team/Organization model."""
import uuid
from datetime import datetime
from app import db


class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)

    # Branding
    logo_url = db.Column(db.String(500), nullable=True)
    accent_color = db.Column(db.String(7), default="#a6706b")

    # Billing
    stripe_subscription_id = db.Column(db.String(100), nullable=True)
    tier = db.Column(db.String(50), default="free")

    # Usage tracking
    monthly_requests_used = db.Column(db.Integer, default=0)
    monthly_requests_limit = db.Column(db.Integer, default=10_000)
    billing_period_start = db.Column(db.DateTime, nullable=True)
    billing_period_end = db.Column(db.DateTime, nullable=True)

    # Settings
    allowed_domains = db.Column(db.String(500), nullable=True)  # comma-separated
    sso_enabled = db.Column(db.Boolean, default=False)
    sso_provider = db.Column(db.String(50), nullable=True)

    # Relations
    members = db.relationship("User", back_populates="team", lazy="dynamic")
    api_keys = db.relationship("ApiKey", back_populates="team", lazy="dynamic", cascade="all, delete-orphan")
    events = db.relationship("LlmEvent", back_populates="team", lazy="dynamic")

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def member_count(self):
        return self.members.count()

    @property
    def usage_percent(self):
        if self.monthly_requests_limit == 0:
            return 0
        return min(100, round((self.monthly_requests_used / self.monthly_requests_limit) * 100, 1))

    def to_dict(self):
        return {
            "id": self.public_id,
            "name": self.name,
            "slug": self.slug,
            "tier": self.tier,
            "members": self.member_count,
            "usage": {
                "used": self.monthly_requests_used,
                "limit": self.monthly_requests_limit,
                "percent": self.usage_percent,
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Team {self.name}>"
