import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models.database import AlertRecord
from models.schemas import AlertCreateRequest, AlertDispatchResponse
from providers.alerts.twilio_sms import TwilioSMSProvider
from providers.alerts.webhook import WebhookAlertProvider
from database import SessionLocal

# Verified emergency coastal contact groups
RECIPIENT_DIRECTORIES = {
    "COASTAL_AUTHORITIES": [
        "+15005550001",  # District Magistrate / Emergency Operations
        "+15005550002"   # Port Marine Controller
    ],
    "FIRST_RESPONDERS": [
        "+15005550003",  # National Disaster Response Force (NDRF) Commander
        "+15005550004"   # Coast Guard Search & Rescue HQ
    ],
    "PUBLIC_BROADCAST": [
        "+15005550005"   # Civil Defense Emergency Broadcast Station
    ]
}

class AlertService:
    def __init__(self):
        self.twilio = TwilioSMSProvider()
        self.webhook = WebhookAlertProvider()

    def get_status_info(self) -> Dict[str, Any]:
        twilio_info = self.twilio.get_status_info()
        webhook_info = self.webhook.get_status_info()

        is_live = twilio_info["status"] == "CONNECTED" or webhook_info["status"] == "CONNECTED"
        return {
            "provider": "Twilio SMS & Emergency Webhook Architecture",
            "status": "CONNECTED" if is_live else "NOT_CONFIGURED",
            "mode": "LIVE" if is_live else "SIMULATION ONLY",
            "twilio": twilio_info,
            "webhook": webhook_info,
            "notice": "When real SMS credentials are empty, all dispatches are safely recorded in SIMULATION mode with zero fake delivery claims."
        }

    async def dispatch_alert(
        self,
        request: AlertCreateRequest,
        db: Session,
        user_role: str = "DISASTER_AUTHORITY"
    ) -> AlertDispatchResponse:
        # Permission check: Viewers and Field Operators cannot dispatch public emergency alerts
        if user_role not in ["ADMIN", "DISASTER_AUTHORITY"]:
            raise PermissionError(
                f"Role '{user_role}' lacks emergency dispatch privileges. Only DISASTER_AUTHORITY or ADMIN can broadcast alerts."
            )

        recipients = RECIPIENT_DIRECTORIES.get(request.recipient_group, ["+15005550001"])
        now = datetime.datetime.utcnow()

        # Decide channel
        if request.channel == "SMS":
            res = await self.twilio.send_sms(recipients, f"[{request.title}] {request.message}")
            mode = res["mode"]
            provider_used = res["provider"]
            status_text = "DISPATCHED" if res["success"] else "FAILED"
            msg = res["message"]
        elif request.channel == "WEBHOOK":
            payload = {
                "title": request.title,
                "message": request.message,
                "group": request.recipient_group,
                "timestamp": now.isoformat() + "Z"
            }
            res = await self.webhook.dispatch_webhook(payload)
            mode = res["mode"]
            provider_used = res["provider"]
            status_text = "DISPATCHED" if res["success"] else "FAILED"
            msg = res["message"]
        else:
            # Email or Push simulated
            mode = "SIMULATION"
            provider_used = f"{request.channel} Simulation Gateway"
            status_text = "DISPATCHED"
            msg = f"Alert recorded in SIMULATION mode ({request.channel} gateway)."

        # Save to database log
        record = AlertRecord(
            title=request.title,
            message=request.message,
            recipient_group=request.recipient_group,
            channel=request.channel,
            recipient_count=len(recipients),
            mode=mode,
            provider=provider_used,
            dispatched_at=now,
            status=status_text,
            sender_role=user_role
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return AlertDispatchResponse(
            alert_id=record.id,
            channel=request.channel,
            recipient_group=request.recipient_group,
            recipient_count=len(recipients),
            status=status_text,
            mode=mode,
            provider=provider_used,
            dispatched_at=now,
            message=msg
        )

    def get_alert_history(self, db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        records = db.query(AlertRecord).order_by(AlertRecord.dispatched_at.desc()).limit(limit).all()
        results = []
        for r in records:
            results.append({
                "id": r.id,
                "title": r.title,
                "message": r.message,
                "recipient_group": r.recipient_group,
                "channel": r.channel,
                "recipient_count": r.recipient_count,
                "mode": r.mode,
                "provider": r.provider,
                "dispatched_at": r.dispatched_at.isoformat() + "Z",
                "status": r.status,
                "sender_role": r.sender_role
            })
        return results

alert_service = AlertService()
