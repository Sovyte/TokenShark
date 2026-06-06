"""API Key model for SDK authentication."""
import uuid
import secrets
from datetime import datetime
from app import db


class ApiKey(db.Model):
    __tablename__ = "api_keys"

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    key_hash = db.Column(db.String(255), unique=True, nullable=False, index=True)
    key_prefix = db.Column(db.String(8), nullable=False)  # ts_xxxx
    name = db.Column(db.String(100), nullable=False)

    # Scopes
    scopes = db.Column(db.String(500), default="ingest,read")  # comma-separated

    # Status
    is_active = db.Column(db.Boolean, default=True)
    last_used_at = db.Column(db.DateTime, nullable=True)
    last_used_ip = db.Column(db.String(45), nullable=True)

    # Relations
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = db.relationship("User", back_populates="api_keys")
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)
    team = db.relationship("Team", back_populates="api_keys")

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)

    @staticmethod
    def generate_key():
        """Generate a new API key. Returns (full_key, prefix, hash)."""
        raw = "ts_" + secrets.token_urlsafe(32)
        prefix = raw[:8]
        # In production, hash with bcrypt or similar
        key_hash = raw  # Simplified for demo
        return raw, prefix, key_hash

    def to_dict(self):
        return {
            "id": self.public_id,
            "name": self.name,
            "prefix": self.key_prefix,
            "scopes": self.scopes.split(",") if self.scopes else [],
            "active": self.is_active,
            "last_used": self.last_used_at.isoformat() if self.last_used_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<ApiKey {self.name}>"
