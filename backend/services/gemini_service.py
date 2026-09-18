import json
import datetime
import httpx
from typing import Dict, Any, Optional, List
from config import settings
from models.schemas import AIAnalysisResponse

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = "gemini-2.5-flash"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 8)

    def get_status_info(self) -> Dict[str, Any]:
        configured = self.is_configured()
        return {
            "provider": f"Google Gemini API ({self.model_name})",
            "status": "CONNECTED" if configured else "NOT_CONFIGURED",
            "endpoint": "generativelanguage.googleapis.com",
            "capabilities": ["Structured Multi-Hazard Reasoning", "Multimodal Geospatial Analysis", "Authority Advisory Drafting"],
            "setup_guide": "Obtain a free Gemini API key from https://aistudio.google.com/ and set GEMINI_API_KEY in .env."
        }

    async def analyze_disaster_scenario(
        self,
        cyclone_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        risk_data: Dict[str, Any],
        infrastructure_data: List[Dict[str, Any]]
    ) -> AIAnalysisResponse:
        """
        Feeds REAL structured metrics to Gemini for expert reasoning and advisory synthesis.
        Strict rule: Gemini does NOT invent numerical numbers; it analyzes the deterministic outputs.
        """
        now = datetime.datetime.utcnow()

        if not self.is_configured():
            raise ValueError(
                "Gemini API is NOT CONFIGURED. Set GEMINI_API_KEY in backend/.env to enable live AI reasoning."
            )

        # Build structured input payload for Gemini
        structured_input = {
            "cyclone_telemetry": {
                "name": cyclone_data.get("name"),
                "storm_id": cyclone_data.get("storm_id"),
                "category": cyclone_data.get("current_position", {}).get("category"),
                "latitude": cyclone_data.get("current_position", {}).get("latitude"),
                "longitude": cyclone_data.get("current_position", {}).get("longitude"),
                "sustained_wind_kmh": cyclone_data.get("current_position", {}).get("wind_speed_kmh"),
                "central_pressure_hpa": cyclone_data.get("current_position", {}).get("pressure_hpa"),
                "movement_speed_kmh": cyclone_data.get("current_position", {}).get("movement_speed_kmh"),
                "movement_direction_deg": cyclone_data.get("current_position", {}).get("movement_dir")
            },
            "meteorological_observations": {
                "source": weather_data.get("source"),
                "rainfall_24h_mm": weather_data.get("rainfall_mm_24h"),
                "station_wind_kmh": weather_data.get("wind_speed_kmh")
            },
            "deterministic_risk_engine_outputs": {
                "composite_risk_score": risk_data.get("overall_risk_score"),
                "risk_level": risk_data.get("risk_level"),
                "modeled_storm_surge_m": risk_data.get("storm_surge", {}).get("estimated_surge_m"),
                "surge_inundation_area_km2": risk_data.get("storm_surge", {}).get("affected_area_km2"),
                "exposed_population_est": risk_data.get("storm_surge", {}).get("population_exposure"),
                "rainfall_horizons_mm": risk_data.get("rainfall_pathways", {}).get("horizons"),
                "submerged_road_points": risk_data.get("rainfall_pathways", {}).get("submerged_road_culverts_est"),
                "road_status": risk_data.get("rainfall_pathways", {}).get("road_vulnerability_status"),
                "evacuation_sectors": [
                    {"name": z.get("name"), "priority": z.get("priority"), "pop": z.get("population")}
                    for z in risk_data.get("evacuation_zones", [])
                ]
            },
            "exposed_critical_infrastructure": [
                {
                    "name": item.get("name"),
                    "type": item.get("asset_type"),
                    "elevation_m": item.get("elevation_m"),
                    "distance_to_coast_km": item.get("distance_to_coast_km"),
                    "hazards": item.get("hazards", [])
                }
                for item in infrastructure_data[:8]
            ]
        }

        system_instruction = (
            "You are CycloneShield AI, a premier disaster intelligence reasoning engine for government authorities. "
            "You are given REAL, VERIFIED meteorological observations, deterministic storm-surge equations, "
            "and OpenStreetMap infrastructure exposure data. "
            "CRITICAL CONSTRAINT: Do NOT invent or hallucinate new numerical values. "
            "Reason specifically over the provided numbers. "
            "Output your analysis strictly in valid JSON matching this schema:\n"
            "{\n"
            '  "risk_explanation": "Comprehensive paragraph explaining why this score was reached based on the wind, surge, and rainfall.",\n'
            '  "main_hazards": ["hazard 1", "hazard 2", "hazard 3", "hazard 4"],\n'
            '  "infrastructure_concerns": ["concern for hospitals", "bridges", "power grid", "telecom"],\n'
            '  "evacuation_priorities": ["priority sector 1", "priority sector 2", "priority sector 3"],\n'
            '  "recommended_preparedness_actions": ["action 1", "action 2", "action 3", "action 4"],\n'
            '  "early_warning_advisory": "Official high-priority public broadcast bulletin text.",\n'
            '  "data_uncertainty_explanation": "Explanation of track forecast cone expansion, barometric deficit assumptions, and gauge network limitations."\n'
            "}"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        request_body = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\nHere is the structured disaster intelligence payload:\n{json.dumps(structured_input, indent=2)}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=request_body)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API returned error {resp.status_code}: {resp.text}")
            result = resp.json()

        try:
            candidate = result["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(candidate)
        except Exception as e:
            raise RuntimeError(f"Failed to parse structured Gemini output: {str(e)}")

        return AIAnalysisResponse(
            source="Google Gemini API (gemini-2.5-flash)",
            model=self.model_name,
            timestamp=now,
            risk_explanation=parsed.get("risk_explanation", ""),
            main_hazards=parsed.get("main_hazards", []),
            infrastructure_concerns=parsed.get("infrastructure_concerns", []),
            evacuation_priorities=parsed.get("evacuation_priorities", []),
            recommended_preparedness_actions=parsed.get("recommended_preparedness_actions", []),
            early_warning_advisory=parsed.get("early_warning_advisory", ""),
            data_uncertainty_explanation=parsed.get("data_uncertainty_explanation", ""),
            raw_structured_input_summary=structured_input
        )

    async def analyze_multimodal_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        context_text: str
    ) -> Dict[str, Any]:
        """Sends an image (e.g. satellite imagery or map view) alongside telemetry to Gemini."""
        if not self.is_configured():
            raise ValueError("Gemini API key is not configured.")

        import base64
        b64_data = base64.b64encode(image_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"

        prompt = (
            "You are CycloneShield AI Multimodal Analyst. "
            "Analyze this satellite/geospatial disaster map image alongside the provided context. "
            "Identify visible cloud eye formation, coastal breaches, flood-prone lowlands, and transport choke points.\n"
            f"Context: {context_text}"
        )

        request_body = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_data
                            }
                        }
                    ]
                }
            ]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=request_body)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini Multimodal API error: {resp.text}")
            result = resp.json()

        text_out = result["candidates"][0]["content"]["parts"][0]["text"]
        return {
            "source": "Google Gemini Multimodal API",
            "model": self.model_name,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "visual_analysis": text_out
        }

gemini_service = GeminiService()
