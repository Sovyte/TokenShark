"""Alert / notification model."""
import uuid
from datetime import datetime
from app import db


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))

    # Alert details
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default="warning")  # info, warning, error, critical
    category = db.Column(db.String(50), default="cost")  # cost, quality, security, system

    # Status
    is_read = db.Column(db.Boolean, default=False)
    is_resolved = db.Column(db.Boolean, default=False)

    # Metadata
    related_event_id = db.Column(db.String(36), nullable=True)
    threshold_value = db.Column(db.Numeric(10, 2), nullable=True)
    actual_value = db.Column(db.Numeric(10, 2), nullable=True)

    # Relations
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = db.relationship("User", back_populates="alerts")
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.public_id,
            "title": self.title,
            "message": self.message,
            "severity": self.severity,
            "category": self.category,
            "read": self.is_read,
            "resolved": self.is_resolved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Alert {self.title}>"
