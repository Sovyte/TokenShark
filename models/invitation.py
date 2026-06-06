"""Team invitation model."""
import uuid
import secrets
from datetime import datetime, timedelta
from app import db


class Invitation(db.Model):
    __tablename__ = "invitations"

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), nullable=False)
    token = db.Column(db.String(64), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(32))
    role = db.Column(db.String(50), default="member")

    # Status
    is_accepted = db.Column(db.Boolean, default=False)
    accepted_at = db.Column(db.DateTime, nullable=True)

    # Relations
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    invited_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def __repr__(self):
        return f"<Invitation {self.email}>"
