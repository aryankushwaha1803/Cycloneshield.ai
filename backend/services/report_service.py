import json
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models.database import SituationReport
from models.schemas import SituationReportResponse, CycloneResponse, RiskCalculationResponse

class ReportService:
    def generate_situation_report(
        self,
        cyclone: CycloneResponse,
        risk: RiskCalculationResponse,
        db: Session,
        generated_by: str = "Disaster Operations Command"
    ) -> SituationReportResponse:
        now = datetime.datetime.utcnow()
        title = f"SITUATION REPORT #{now.strftime('%Y%m%d-%H%M')}: {cyclone.name.upper()} EMERGENCY OPERATIONS"

        met_summary = {
            "cyclone_name": cyclone.name,
            "category": cyclone.current_position.category,
            "sustained_wind_kmh": cyclone.current_position.wind_speed_kmh,
            "central_pressure_hpa": cyclone.current_position.pressure_hpa,
            "landfall_trajectory": f"{cyclone.current_position.movement_dir:.0f}° at {cyclone.current_position.movement_speed_kmh} km/h",
            "source": cyclone.source
        }

        surge_summary = {
            "modeled_peak_surge_m": risk.storm_surge["estimated_surge_m"],
            "inundation_area_km2": risk.storm_surge["affected_area_km2"],
            "coastal_penetration_km": risk.storm_surge["coastal_penetration_km"],
            "model_type": risk.storm_surge["model_type"]
        }

        infra_summary = {
            "critical_facilities_at_risk": risk.critical_infrastructure_exposed,
            "road_vulnerability_level": risk.rainfall_pathways["road_vulnerability_status"],
            "submerged_culverts_est": risk.rainfall_pathways["submerged_road_culverts_est"]
        }

        evac_summary = {
            "exposed_population_est": risk.exposed_population,
            "sectors_count": len(risk.evacuation_zones),
            "sectors": [
                {"name": z.name, "priority": z.priority, "population": z.population}
                for z in risk.evacuation_zones
            ]
        }

        advisory_text = (
            f"URGENT DISASTER ADVISORY: {cyclone.name} is tracking towards coastal areas with peak sustained winds "
            f"of {cyclone.current_position.wind_speed_kmh} km/h and minimum central pressure of {cyclone.current_position.pressure_hpa} hPa. "
            f"Computational modeling estimates storm surge up to {risk.storm_surge['estimated_surge_m']} meters, threatening "
            f"{risk.exposed_population:,} residents and {risk.critical_infrastructure_exposed} critical infrastructure facilities. "
            f"Mandatory evacuation is recommended for Sector 1 lowlands. All maritime ports must remain on Stage 4 alert."
        )

        record = SituationReport(
            cyclone_id=1,
            report_title=title,
            executive_summary=f"{cyclone.name} has escalated to {cyclone.current_position.category}. Composite risk score is {risk.overall_risk_score}/100 ({risk.risk_level}).",
            hazards_summary=json.dumps(surge_summary),
            infrastructure_summary=json.dumps(infra_summary),
            evacuation_advisories=advisory_text,
            raw_json=json.dumps({
                "meteorological": met_summary,
                "surge": surge_summary,
                "infrastructure": infra_summary,
                "evacuation": evac_summary
            }),
            generated_at=now,
            generated_by=generated_by
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return SituationReportResponse(
            report_id=record.id,
            cyclone_name=cyclone.name,
            generated_at=now,
            generated_by=generated_by,
            threat_status=f"{risk.risk_level} THREAT (Score {risk.overall_risk_score}/100)",
            meteorological_summary=met_summary,
            surge_and_flood_summary=surge_summary,
            infrastructure_impact_summary=infra_summary,
            evacuation_summary=evac_summary,
            official_advisory=advisory_text
        )

report_service = ReportService()
