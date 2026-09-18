import math
import datetime
from typing import Dict, Any, List, Optional
from config import settings
from models.schemas import (
    RiskCalculationResponse, RiskScoreBreakdown, EvacuationZoneSchema,
    CycloneResponse, WeatherCurrentSchema, InfrastructureAssetSchema
)

class RiskEngine:
    def __init__(self):
        self.w_surge = settings.RISK_WEIGHT_SURGE
        self.w_wind = settings.RISK_WEIGHT_WIND
        self.w_rain = settings.RISK_WEIGHT_RAIN
        self.w_infra = settings.RISK_WEIGHT_INFRA
        self.w_exposure = settings.RISK_WEIGHT_EXPOSURE

    def compute_storm_surge(
        self,
        wind_speed_kmh: float,
        central_pressure_hpa: float,
        coastal_angle_deg: float = 45.0,
        shelf_width_km: float = 65.0,
        shelf_depth_m: float = 28.0,
        shoaling_factor: float = 1.25
    ) -> Dict[str, Any]:
        """
        Computational physical storm-surge model based on Jelesnianski / SLOSH parametric equations:
        Delta_H = Delta_H_barometric + Delta_H_wind_stress * shoaling_factor
        """
        # 1. Barometric inverted barometer effect (1 cm surge per 1 hPa deficit)
        pressure_deficit = max(0.0, 1013.25 - central_pressure_hpa)
        h_barometric = 0.0104 * pressure_deficit  # in meters

        # 2. Wind stress surge
        # tau = Cd * rho_air * v^2
        v_ms = (wind_speed_kmh * 1000.0) / 3600.0
        cd = 0.0026 if v_ms > 25.0 else 0.0018
        rho_air = 1.22
        rho_water = 1025.0
        g = 9.81
        wind_stress = cd * rho_air * (v_ms ** 2)

        # Wind setup across continental shelf: H_wind = (tau * L) / (g * rho_w * D) * cos(theta)
        shelf_length_m = shelf_width_km * 1000.0
        theta_rad = math.radians(min(80.0, abs(coastal_angle_deg)))
        h_wind = (wind_stress * shelf_length_m) / (g * rho_water * shelf_depth_m) * math.cos(theta_rad)

        # 3. Combined peak surge with shoaling
        peak_surge_m = round(h_barometric + (h_wind * shoaling_factor), 2)
        peak_surge_m = max(0.8, min(8.5, peak_surge_m))  # Physical bounds

        # Coastal penetration distance and affected area estimate
        penetration_km = round(max(0.5, peak_surge_m * 1.8), 1)
        coastal_front_km = round(max(40.0, wind_speed_kmh * 0.8), 1)
        affected_area_km2 = round(coastal_front_km * penetration_km, 1)

        # Estimated coastal population in vulnerable low-lying zone (average ~450 people/km2)
        exposed_population = int(affected_area_km2 * 465)

        return {
            "estimated_surge_m": peak_surge_m,
            "barometric_component_m": round(h_barometric, 2),
            "wind_stress_component_m": round(h_wind * shoaling_factor, 2),
            "affected_area_km2": affected_area_km2,
            "population_exposure": exposed_population,
            "coastal_penetration_km": penetration_km,
            "coastal_front_km": coastal_front_km,
            "shoaling_factor": shoaling_factor,
            "shelf_width_km": shelf_width_km,
            "model_type": "Computational SLOSH / Jelesnianski Hydrodynamic Parametric Model",
            "provenance": "MODELED STORM-SURGE RISK (Not an official tidal station measurement)"
        }

    def compute_rainfall_pathways(
        self,
        rainfall_24h_mm: float,
        wind_speed_kmh: float
    ) -> Dict[str, Any]:
        """
        Calculates rainfall damage pathways across 6h, 12h, 24h, and 48h horizons,
        depression water accumulation, and road/bridge access vulnerability.
        """
        # Temporal projection ratios based on standard cyclonic rainbands
        r_6h = round(rainfall_24h_mm * 0.35, 1)
        r_12h = round(rainfall_24h_mm * 0.65, 1)
        r_24h = round(rainfall_24h_mm, 1)
        r_48h = round(rainfall_24h_mm * 1.45, 1)

        # Runoff coefficient in saturated coastal soils (C = 0.75)
        depression_water_depth_cm = round((rainfall_24h_mm * 0.72) / 10.0, 1)
        submerged_culverts_est = int(max(4, rainfall_24h_mm * 0.12))
        road_risk = "IMPASSABLE" if rainfall_24h_mm > 220 else ("HIGH" if rainfall_24h_mm > 140 else "MODERATE")

        return {
            "horizons": {
                "6h_mm": r_6h,
                "12h_mm": r_12h,
                "24h_mm": r_24h,
                "48h_mm": r_48h
            },
            "depression_accumulation_cm": depression_water_depth_cm,
            "submerged_road_culverts_est": submerged_culverts_est,
            "road_vulnerability_status": road_risk,
            "hydrological_pathway": "Precipitation -> Low Elevation Coastal Depressions -> Runoff Accumulation -> Roadway Submergence",
            "provenance": "Rainfall Damage Pathways Modeled from Numerical Weather Telemetry"
        }

    def calculate_deterministic_risk(
        self,
        cyclone: CycloneResponse,
        weather: WeatherCurrentSchema,
        infrastructure: List[InfrastructureAssetSchema],
        surge_override_m: Optional[float] = None
    ) -> RiskCalculationResponse:
        """
        Executes the transparent deterministic multi-hazard risk engine:
        Risk = 0.25 * Surge + 0.20 * Wind + 0.20 * Rain + 0.20 * Infra + 0.15 * Exposure
        """
        curr = cyclone.current_position
        wind_kmh = curr.wind_speed_kmh
        pressure_hpa = curr.pressure_hpa
        rain_24h = weather.rainfall_mm_24h

        # Compute surge
        surge_data = self.compute_storm_surge(wind_kmh, pressure_hpa)
        if surge_override_m is not None and surge_override_m > 0:
            surge_data["estimated_surge_m"] = surge_override_m

        # Compute rainfall pathways
        rain_data = self.compute_rainfall_pathways(rain_24h, wind_kmh)

        # Normalization to [0, 100]
        # 1. Surge score: 5.0m surge = 100
        surge_score = min(100.0, max(0.0, (surge_data["estimated_surge_m"] / 5.0) * 100.0))

        # 2. Wind score: 220 km/h = 100
        wind_score = min(100.0, max(0.0, (wind_kmh / 220.0) * 100.0))

        # 3. Rain score: 300 mm = 100
        rain_score = min(100.0, max(0.0, (rain_24h / 300.0) * 100.0))

        # 4. Infrastructure score: percentage of assets within surge zone or low elevation
        exposed_assets = [
            a for a in infrastructure
            if a.distance_to_coast_km <= surge_data["coastal_penetration_km"] * 1.5 or a.elevation_m <= surge_data["estimated_surge_m"] + 1.5
        ]
        infra_ratio = len(exposed_assets) / max(1, len(infrastructure))
        infra_score = min(100.0, max(15.0, infra_ratio * 120.0))

        # 5. Exposure score: based on affected population density
        pop_exposed = surge_data["population_exposure"]
        exposure_score = min(100.0, max(10.0, (pop_exposed / 250000.0) * 100.0))

        # Weighted calculation
        overall_score = (
            self.w_surge * surge_score +
            self.w_wind * wind_score +
            self.w_rain * rain_score +
            self.w_infra * infra_score +
            self.w_exposure * exposure_score
        )
        overall_score = round(min(100.0, max(0.0, overall_score)), 1)

        # Risk level determination
        if overall_score >= 76.0:
            risk_level = "CRITICAL"
        elif overall_score >= 51.0:
            risk_level = "HIGH"
        elif overall_score >= 26.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        breakdown = RiskScoreBreakdown(
            surge_score=round(surge_score, 1),
            surge_weight=self.w_surge,
            wind_score=round(wind_score, 1),
            wind_weight=self.w_wind,
            rain_score=round(rain_score, 1),
            rain_weight=self.w_rain,
            infra_score=round(infra_score, 1),
            infra_weight=self.w_infra,
            exposure_score=round(exposure_score, 1),
            exposure_weight=self.w_exposure,
            overall_score=overall_score,
            formula_display=f"Risk = {self.w_surge} * Surge ({surge_score:.1f}) + {self.w_wind} * Wind ({wind_score:.1f}) + {self.w_rain} * Rain ({rain_score:.1f}) + {self.w_infra} * Infra ({infra_score:.1f}) + {self.w_exposure} * Exposure ({exposure_score:.1f})"
        )

        # Generate evacuation zones
        evac_zones = self._generate_evacuation_zones(curr.latitude, curr.longitude, surge_data, rain_data, exposed_assets)

        return RiskCalculationResponse(
            cyclone_id=cyclone.storm_id,
            timestamp=datetime.datetime.utcnow(),
            overall_risk_score=overall_score,
            risk_level=risk_level,
            storm_surge=surge_data,
            rainfall_pathways=rain_data,
            factor_breakdown=breakdown,
            evacuation_zones=evac_zones,
            critical_infrastructure_exposed=len(exposed_assets),
            exposed_population=pop_exposed,
            model_metadata={
                "deterministic": True,
                "surge_equation": "Jelesnianski SLOSH Inverted-Barometer & Wind Setup Formulation",
                "weights": {
                    "surge": self.w_surge,
                    "wind": self.w_wind,
                    "rain": self.w_rain,
                    "infrastructure": self.w_infra,
                    "exposure": self.w_exposure
                },
                "disclaimer": "Decision-support vulnerability model. Not an official government evacuation order."
            }
        )

    def _generate_evacuation_zones(
        self,
        center_lat: float,
        center_lon: float,
        surge_data: Dict[str, Any],
        rain_data: Dict[str, Any],
        exposed_assets: List[InfrastructureAssetSchema]
    ) -> List[EvacuationZoneSchema]:
        """Generates explainable evacuation sectors around the impact zone."""
        surge_m = surge_data["estimated_surge_m"]
        rain_24h = rain_data["horizons"]["24h_mm"]

        zones = [
            EvacuationZoneSchema(
                zone_id="ZONE-A-COASTAL-LOW",
                name="Sector 1: Coastal Lowlands (0-5 km from Shore)",
                priority="CRITICAL",
                population=int(surge_data["population_exposure"] * 0.55),
                surge_height_m=surge_m,
                rainfall_mm_24h=rain_24h,
                nearest_shelter_km=2.4,
                road_risk_level="IMPASSABLE",
                center_lat=round(center_lat + 0.15, 3),
                center_lon=round(center_lon + 0.10, 3),
                polygon_coordinates=[
                    [round(center_lon - 0.25, 4), round(center_lat + 0.05, 4)],
                    [round(center_lon + 0.35, 4), round(center_lat + 0.05, 4)],
                    [round(center_lon + 0.30, 4), round(center_lat + 0.28, 4)],
                    [round(center_lon - 0.20, 4), round(center_lat + 0.28, 4)],
                    [round(center_lon - 0.25, 4), round(center_lat + 0.05, 4)]
                ],
                rationale=f"Direct storm surge inundation threat ({surge_m:.1f} m) combined with road access failure. Immediate mandatory evacuation to cyclone shelters required."
            ),
            EvacuationZoneSchema(
                zone_id="ZONE-B-INTERMEDIATE",
                name="Sector 2: Estuary & Canal Inundation Corridor",
                priority="HIGH",
                population=int(surge_data["population_exposure"] * 0.30),
                surge_height_m=round(surge_m * 0.65, 1),
                rainfall_mm_24h=round(rain_24h * 0.9, 1),
                nearest_shelter_km=4.8,
                road_risk_level="HIGH",
                center_lat=round(center_lat + 0.35, 3),
                center_lon=round(center_lon + 0.25, 3),
                polygon_coordinates=[
                    [round(center_lon - 0.20, 4), round(center_lat + 0.28, 4)],
                    [round(center_lon + 0.30, 4), round(center_lat + 0.28, 4)],
                    [round(center_lon + 0.25, 4), round(center_lat + 0.50, 4)],
                    [round(center_lon - 0.15, 4), round(center_lat + 0.50, 4)],
                    [round(center_lon - 0.20, 4), round(center_lat + 0.28, 4)]
                ],
                rationale="Severe runoff accumulation and backwater tidal surge along river banks. Primary arterial roads facing water accumulation."
            ),
            EvacuationZoneSchema(
                zone_id="ZONE-C-INLAND-REFUGE",
                name="Sector 3: Elevated Inland Transition Buffer",
                priority="MODERATE",
                population=int(surge_data["population_exposure"] * 0.15),
                surge_height_m=0.0,
                rainfall_mm_24h=round(rain_24h * 0.75, 1),
                nearest_shelter_km=8.5,
                road_risk_level="MEDIUM",
                center_lat=round(center_lat + 0.60, 3),
                center_lon=round(center_lon + 0.40, 3),
                polygon_coordinates=[
                    [round(center_lon - 0.15, 4), round(center_lat + 0.50, 4)],
                    [round(center_lon + 0.25, 4), round(center_lat + 0.50, 4)],
                    [round(center_lon + 0.20, 4), round(center_lat + 0.72, 4)],
                    [round(center_lon - 0.10, 4), round(center_lat + 0.72, 4)],
                    [round(center_lon - 0.15, 4), round(center_lat + 0.50, 4)]
                ],
                rationale="Safe from storm surge inundation. Heavy wind gusts and localized urban waterlogging possible. Designated reception zone for Sector 1 evacuees."
            )
        ]
        return zones

risk_engine = RiskEngine()
