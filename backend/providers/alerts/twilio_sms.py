import datetime
from typing import Dict, Any, Optional
from config import settings

class TwilioSMSProvider:
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_FROM_NUMBER

    def is_configured(self) -> bool:
        return bool(
            self.account_sid and len(self.account_sid.strip()) > 10 and
            self.auth_token and len(self.auth_token.strip()) > 10 and
            self.from_number and len(self.from_number.strip()) > 5
        )

    def get_status_info(self) -> Dict[str, Any]:
        configured = self.is_configured()
        return {
            "provider": "Twilio Programmable SMS API",
            "status": "CONNECTED" if configured else "NOT_CONFIGURED",
            "mode": "LIVE" if configured else "SIMULATION ONLY",
            "from_number": self.from_number if configured else "Not configured",
            "setup_guide": "To enable LIVE SMS dispatch, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in .env."
        }

    async def send_sms(self, to_numbers: list[str], body: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "success": True,
                "mode": "SIMULATION",
                "provider": "Simulation Recorder",
                "message": "Alert recorded in SIMULATION mode (Twilio SMS credentials not configured).",
                "recipient_count": len(to_numbers)
            }

        try:
            from twilio.rest import Client
            client = Client(self.account_sid, self.auth_token)
            sent_count = 0
            for num in to_numbers:
                client.messages.create(
                    body=body,
                    from_=self.from_number,
                    to=num
                )
                sent_count += 1

            return {
                "success": True,
                "mode": "LIVE",
                "provider": "Twilio SMS",
                "message": f"Successfully sent live emergency SMS alerts to {sent_count} verified numbers.",
                "recipient_count": sent_count
            }
        except Exception as e:
            return {
                "success": False,
                "mode": "LIVE_ERROR",
                "provider": "Twilio SMS",
                "message": f"Twilio SMS dispatch failed: {str(e)}",
                "recipient_count": 0
            }
