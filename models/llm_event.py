"""LLM event/telemetry log model."""
import uuid
from datetime import datetime
from app import db


class LlmEvent(db.Model):
    __tablename__ = "llm_events"

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))

    # Request metadata
    request_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Provider & Model
    provider = db.Column(db.String(50), nullable=False, index=True)  # openai, anthropic, etc.
    model = db.Column(db.String(100), nullable=False, index=True)
    model_version = db.Column(db.String(50), nullable=True)

    # Usage
    prompt_tokens = db.Column(db.Integer, default=0)
    completion_tokens = db.Column(db.Integer, default=0)
    total_tokens = db.Column(db.Integer, default=0)
    cost_usd = db.Column(db.Numeric(10, 6), default=0)
    latency_ms = db.Column(db.Integer, default=0)

    # Quality
    status = db.Column(db.String(50), default="success")  # success, error, timeout, refused
    error_code = db.Column(db.String(100), nullable=True)
    refusal_detected = db.Column(db.Boolean, default=False)

    # Attribution
    user_id = db.Column(db.String(100), nullable=True, index=True)  # end-user ID from SDK
    feature_tag = db.Column(db.String(100), nullable=True, index=True)
    prompt_version = db.Column(db.String(50), nullable=True)
    environment = db.Column(db.String(50), default="production")  # production, staging, dev

    # Content (truncated for storage)
    prompt_preview = db.Column(db.Text, nullable=True)
    response_preview = db.Column(db.Text, nullable=True)
    prompt_hash = db.Column(db.String(64), nullable=True)

    # Relations
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)
    team = db.relationship("Team", back_populates="events")
    api_key_id = db.Column(db.Integer, db.ForeignKey("api_keys.id"), nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def cost_formatted(self):
        return f"${float(self.cost_usd):.6f}"

    def to_dict(self):
        return {
            "id": self.public_id,
            "request_id": self.request_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "provider": self.provider,
            "model": self.model,
            "tokens": {
                "prompt": self.prompt_tokens,
                "completion": self.completion_tokens,
                "total": self.total_tokens,
            },
            "cost": float(self.cost_usd),
            "latency": self.latency_ms,
            "status": self.status,
            "user_id": self.user_id,
            "feature_tag": self.feature_tag,
            "environment": self.environment,
        }

    def __repr__(self):
        return f"<LlmEvent {self.request_id}>"
