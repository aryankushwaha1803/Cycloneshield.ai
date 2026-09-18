import httpx
import datetime
from typing import Dict, Any, Optional
from config import settings

class WebhookAlertProvider:
    def __init__(self):
        self.webhook_url = settings.SMS_PROVIDER_URL

    def is_configured(self) -> bool:
        return bool(self.webhook_url and self.webhook_url.startswith("http"))

    def get_status_info(self) -> Dict[str, Any]:
        configured = self.is_configured()
        return {
            "provider": "Emergency Webhook Dispatcher",
            "status": "CONNECTED" if configured else "NOT_CONFIGURED",
            "mode": "LIVE" if configured else "SIMULATION ONLY",
            "endpoint": self.webhook_url if configured else "Not configured"
        }

    async def dispatch_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "success": True,
                "mode": "SIMULATION",
                "provider": "Simulation Recorder",
                "message": "Webhook alert recorded in SIMULATION mode (SMS_PROVIDER_URL not configured).",
                "recipient_count": 1
            }

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                headers = {}
                if settings.SMS_PROVIDER_API_KEY:
                    headers["Authorization"] = f"Bearer {settings.SMS_PROVIDER_API_KEY}"
                resp = await client.post(self.webhook_url, json=payload, headers=headers)
                return {
                    "success": resp.status_code in [200, 201, 202, 204],
                    "mode": "LIVE",
                    "provider": "Emergency Webhook",
                    "status_code": resp.status_code,
                    "message": f"Webhook dispatched with status {resp.status_code}.",
                    "recipient_count": 1
                }
        except Exception as e:
            return {
                "success": False,
                "mode": "LIVE_ERROR",
                "provider": "Emergency Webhook",
                "message": f"Webhook dispatch error: {str(e)}",
                "recipient_count": 0
            }
