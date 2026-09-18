import datetime
from typing import List, Optional, Dict, Any
from models.schemas import (
    CycloneResponse, CycloneTrackPointSchema, WindRadiiSchema,
    HistoricalCycloneListItem, ForecastConePolygon
)
from providers.cyclone.geometry import calculate_forecast_cone

HISTORICAL_STORMS_CATALOG: Dict[str, Dict[str, Any]] = {
    "biparjoy-2023": {
        "storm_id": "biparjoy-2023",
        "name": "Cyclone Biparjoy",
        "basin": "North Indian Ocean (Arabian Sea)",
        "year": 2023,
        "status": "HISTORICAL",
        "category": "Extremely Severe Cyclonic Storm",
        "max_wind_kmh": 165.0,
        "min_pressure_hpa": 954.0,
        "landfall_area": "Jakhau Port, Kutch District, Gujarat, India",
        "source": "IMD RSMC New Delhi & IBTrACS v04r00 Official Best Track",
        "points": [
            # Timestamp, Lat, Lon, Wind km/h, Wind kts, Pressure hPa, Category, Move Dir, Move Spd, IsForecast, R34_ne, r34_se, r34_sw, r34_nw
            {"dt": "2023-06-11T00:00:00Z", "lat": 18.2, "lon": 67.7, "wind": 155.0, "kts": 85.0, "p": 966.0, "cat": "Very Severe Cyclonic Storm", "dir": 355.0, "spd": 8.0, "fc": False, "r34": [160, 140, 100, 120]},
            {"dt": "2023-06-11T12:00:00Z", "lat": 18.9, "lon": 67.8, "wind": 165.0, "kts": 90.0, "p": 958.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 5.0, "spd": 9.0, "fc": False, "r34": [180, 150, 110, 130]},
            {"dt": "2023-06-12T00:00:00Z", "lat": 19.5, "lon": 67.7, "wind": 165.0, "kts": 90.0, "p": 954.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 355.0, "spd": 7.0, "fc": False, "r34": [190, 160, 120, 140]},
            {"dt": "2023-06-12T12:00:00Z", "lat": 20.6, "lon": 67.5, "wind": 155.0, "kts": 85.0, "p": 964.0, "cat": "Very Severe Cyclonic Storm", "dir": 350.0, "spd": 8.0, "fc": False, "r34": [180, 150, 110, 130]},
            {"dt": "2023-06-13T00:00:00Z", "lat": 21.2, "lon": 67.4, "wind": 150.0, "kts": 80.0, "p": 968.0, "cat": "Very Severe Cyclonic Storm", "dir": 340.0, "spd": 7.0, "fc": False, "r34": [170, 140, 100, 120]},
            {"dt": "2023-06-13T12:00:00Z", "lat": 21.6, "lon": 67.2, "wind": 145.0, "kts": 78.0, "p": 970.0, "cat": "Very Severe Cyclonic Storm", "dir": 330.0, "spd": 6.0, "fc": False, "r34": [160, 130, 90, 110]},
            {"dt": "2023-06-14T00:00:00Z", "lat": 22.1, "lon": 67.0, "wind": 140.0, "kts": 75.0, "p": 972.0, "cat": "Very Severe Cyclonic Storm", "dir": 20.0, "spd": 6.0, "fc": False, "r34": [160, 130, 90, 110]},
            {"dt": "2023-06-14T12:00:00Z", "lat": 22.7, "lon": 67.3, "wind": 135.0, "kts": 72.0, "p": 974.0, "cat": "Very Severe Cyclonic Storm", "dir": 40.0, "spd": 7.0, "fc": False, "r34": [150, 120, 80, 100]},
            # Peak Landfall Window (Current Reference Position)
            {"dt": "2023-06-15T00:00:00Z", "lat": 23.0, "lon": 67.9, "wind": 140.0, "kts": 75.0, "p": 970.0, "cat": "Very Severe Cyclonic Storm", "dir": 45.0, "spd": 8.0, "fc": False, "r34": [150, 130, 90, 110]},
            # Forecast track leading to landfall and inland decay
            {"dt": "2023-06-15T12:00:00Z", "lat": 23.3, "lon": 68.6, "wind": 130.0, "kts": 70.0, "p": 974.0, "cat": "Landfall (Kutch Coast)", "dir": 55.0, "spd": 11.0, "fc": True, "r34": [140, 120, 80, 90]},
            {"dt": "2023-06-16T00:00:00Z", "lat": 23.7, "lon": 69.5, "wind": 95.0, "kts": 50.0, "p": 985.0, "cat": "Severe Cyclonic Storm", "dir": 60.0, "spd": 13.0, "fc": True, "r34": [110, 90, 60, 70]},
            {"dt": "2023-06-16T12:00:00Z", "lat": 24.2, "lon": 70.7, "wind": 65.0, "kts": 35.0, "p": 992.0, "cat": "Cyclonic Storm", "dir": 65.0, "spd": 15.0, "fc": True, "r34": [80, 60, 40, 50]},
            {"dt": "2023-06-17T00:00:00Z", "lat": 24.8, "lon": 72.1, "wind": 45.0, "kts": 25.0, "p": 998.0, "cat": "Deep Depression (Inland)", "dir": 70.0, "spd": 16.0, "fc": True, "r34": [50, 40, 30, 30]}
        ]
    },
    "fani-2019": {
        "storm_id": "fani-2019",
        "name": "Cyclone Fani",
        "basin": "North Indian Ocean (Bay of Bengal)",
        "year": 2019,
        "status": "HISTORICAL",
        "category": "Extremely Severe Cyclonic Storm",
        "max_wind_kmh": 215.0,
        "min_pressure_hpa": 932.0,
        "landfall_area": "Puri Coast, Odisha, India",
        "source": "IMD RSMC New Delhi & IBTrACS v04r00 Official Best Track",
        "points": [
            {"dt": "2019-04-29T00:00:00Z", "lat": 8.5, "lon": 86.8, "wind": 100.0, "kts": 55.0, "p": 992.0, "cat": "Severe Cyclonic Storm", "dir": 310.0, "spd": 14.0, "fc": False, "r34": [140, 120, 80, 100]},
            {"dt": "2019-04-30T00:00:00Z", "lat": 11.5, "lon": 85.8, "wind": 140.0, "kts": 75.0, "p": 974.0, "cat": "Very Severe Cyclonic Storm", "dir": 335.0, "spd": 16.0, "fc": False, "r34": [160, 140, 100, 120]},
            {"dt": "2019-05-01T00:00:00Z", "lat": 14.1, "lon": 84.8, "wind": 185.0, "kts": 100.0, "p": 948.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 350.0, "spd": 13.0, "fc": False, "r34": [190, 170, 120, 150]},
            {"dt": "2019-05-02T00:00:00Z", "lat": 16.8, "lon": 84.7, "wind": 215.0, "kts": 115.0, "p": 932.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 10.0, "spd": 15.0, "fc": False, "r34": [210, 180, 130, 160]},
            # Peak Observation Position before landfall
            {"dt": "2019-05-02T18:00:00Z", "lat": 18.9, "lon": 85.3, "wind": 205.0, "kts": 110.0, "p": 937.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 25.0, "spd": 18.0, "fc": False, "r34": [200, 170, 120, 150]},
            # Forecast Points to Landfall
            {"dt": "2019-05-03T03:00:00Z", "lat": 19.7, "lon": 85.8, "wind": 195.0, "kts": 105.0, "p": 940.0, "cat": "Landfall (Puri)", "dir": 35.0, "spd": 22.0, "fc": True, "r34": [180, 150, 100, 130]},
            {"dt": "2019-05-03T12:00:00Z", "lat": 20.8, "lon": 86.6, "wind": 130.0, "kts": 70.0, "p": 970.0, "cat": "Very Severe Cyclonic Storm", "dir": 40.0, "spd": 24.0, "fc": True, "r34": [130, 100, 70, 90]},
            {"dt": "2019-05-04T00:00:00Z", "lat": 22.5, "lon": 88.1, "wind": 80.0, "kts": 45.0, "p": 988.0, "cat": "Cyclonic Storm (Bengal)", "dir": 45.0, "spd": 26.0, "fc": True, "r34": [80, 60, 40, 50]}
        ]
    },
    "amphan-2020": {
        "storm_id": "amphan-2020",
        "name": "Cyclone Amphan",
        "basin": "North Indian Ocean (Bay of Bengal)",
        "year": 2020,
        "status": "HISTORICAL",
        "category": "Super Cyclonic Storm",
        "max_wind_kmh": 240.0,
        "min_pressure_hpa": 920.0,
        "landfall_area": "Sundarbans & Digha, West Bengal, India / Bangladesh",
        "source": "IMD RSMC New Delhi & JTWC Archive",
        "points": [
            {"dt": "2020-05-17T00:00:00Z", "lat": 11.4, "lon": 86.0, "wind": 110.0, "kts": 60.0, "p": 988.0, "cat": "Severe Cyclonic Storm", "dir": 5.0, "spd": 12.0, "fc": False, "r34": [150, 130, 90, 110]},
            {"dt": "2020-05-18T00:00:00Z", "lat": 13.4, "lon": 86.2, "wind": 215.0, "kts": 115.0, "p": 935.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 10.0, "spd": 14.0, "fc": False, "r34": [210, 180, 130, 160]},
            {"dt": "2020-05-18T12:00:00Z", "lat": 14.9, "lon": 86.5, "wind": 240.0, "kts": 130.0, "p": 920.0, "cat": "Super Cyclonic Storm", "dir": 15.0, "spd": 15.0, "fc": False, "r34": [230, 200, 150, 180]},
            {"dt": "2020-05-19T00:00:00Z", "lat": 16.5, "lon": 86.8, "wind": 220.0, "kts": 120.0, "p": 928.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 20.0, "spd": 16.0, "fc": False, "r34": [220, 190, 140, 170]},
            {"dt": "2020-05-19T18:00:00Z", "lat": 18.8, "lon": 87.2, "wind": 185.0, "kts": 100.0, "p": 945.0, "cat": "Extremely Severe Cyclonic Storm", "dir": 25.0, "spd": 19.0, "fc": False, "r34": [200, 170, 120, 150]},
            # Forecast / Landfall Path
            {"dt": "2020-05-20T12:00:00Z", "lat": 21.7, "lon": 88.3, "wind": 155.0, "kts": 85.0, "p": 958.0, "cat": "Landfall (Sundarbans)", "dir": 30.0, "spd": 25.0, "fc": True, "r34": [170, 140, 90, 120]},
            {"dt": "2020-05-21T00:00:00Z", "lat": 23.6, "lon": 89.2, "wind": 90.0, "kts": 50.0, "p": 980.0, "cat": "Cyclonic Storm (Kolkata/Inland)", "dir": 35.0, "spd": 28.0, "fc": True, "r34": [110, 80, 50, 70]}
        ]
    },
    "ian-2022": {
        "storm_id": "ian-2022",
        "name": "Hurricane Ian",
        "basin": "North Atlantic (Gulf of Mexico)",
        "year": 2022,
        "status": "HISTORICAL",
        "category": "Category 5 Hurricane",
        "max_wind_kmh": 260.0,
        "min_pressure_hpa": 937.0,
        "landfall_area": "Cayo Costa & Fort Myers, Florida, USA",
        "source": "NOAA National Hurricane Center (NHC) Official Best Track",
        "points": [
            {"dt": "2022-09-26T00:00:00Z", "lat": 18.3, "lon": -82.4, "wind": 120.0, "kts": 65.0, "p": 983.0, "cat": "Category 1 Hurricane", "dir": 325.0, "spd": 19.0, "fc": False, "r34": [160, 130, 90, 120]},
            {"dt": "2022-09-27T00:00:00Z", "lat": 21.6, "lon": -83.5, "wind": 165.0, "kts": 90.0, "p": 965.0, "cat": "Category 3 Hurricane", "dir": 345.0, "spd": 17.0, "fc": False, "r34": [190, 150, 110, 140]},
            {"dt": "2022-09-28T00:00:00Z", "lat": 24.9, "lon": -83.0, "wind": 215.0, "kts": 115.0, "p": 950.0, "cat": "Category 4 Hurricane", "dir": 15.0, "spd": 15.0, "fc": False, "r34": [220, 180, 130, 170]},
            {"dt": "2022-09-28T12:00:00Z", "lat": 26.1, "lon": -82.7, "wind": 250.0, "kts": 135.0, "p": 940.0, "cat": "Category 4 / Near Cat 5", "dir": 35.0, "spd": 15.0, "fc": False, "r34": [250, 210, 140, 190]},
            # Landfall Reference Window
            {"dt": "2022-09-28T19:05:00Z", "lat": 26.7, "lon": -82.2, "wind": 240.0, "kts": 130.0, "p": 942.0, "cat": "Landfall (Cayo Costa, FL)", "dir": 45.0, "spd": 15.0, "fc": False, "r34": [240, 200, 130, 180]},
            # Inland Track
            {"dt": "2022-09-29T06:00:00Z", "lat": 27.8, "lon": -81.4, "wind": 130.0, "kts": 70.0, "p": 978.0, "cat": "Tropical Storm / Inland FL", "dir": 45.0, "spd": 17.0, "fc": True, "r34": [190, 160, 100, 130]},
            {"dt": "2022-09-30T00:00:00Z", "lat": 30.1, "lon": -79.9, "wind": 120.0, "kts": 65.0, "p": 985.0, "cat": "Category 1 (Atlantic Emergence)", "dir": 15.0, "spd": 20.0, "fc": True, "r34": [200, 170, 110, 140]}
        ]
    },
    "remal-2024": {
        "storm_id": "remal-2024",
        "name": "Cyclone Remal",
        "basin": "North Indian Ocean (Bay of Bengal)",
        "year": 2024,
        "status": "HISTORICAL",
        "category": "Severe Cyclonic Storm",
        "max_wind_kmh": 120.0,
        "min_pressure_hpa": 978.0,
        "landfall_area": "Sagar Island & Khepupara Coast",
        "source": "IMD RSMC New Delhi Official Bulletins",
        "points": [
            {"dt": "2024-05-25T06:00:00Z", "lat": 18.2, "lon": 89.4, "wind": 65.0, "kts": 35.0, "p": 996.0, "cat": "Cyclonic Storm", "dir": 355.0, "spd": 14.0, "fc": False, "r34": [120, 100, 70, 90]},
            {"dt": "2024-05-25T18:00:00Z", "lat": 19.8, "lon": 89.3, "wind": 85.0, "kts": 45.0, "p": 990.0, "cat": "Cyclonic Storm", "dir": 355.0, "spd": 15.0, "fc": False, "r34": [140, 110, 80, 100]},
            {"dt": "2024-05-26T06:00:00Z", "lat": 20.9, "lon": 89.2, "wind": 105.0, "kts": 55.0, "p": 984.0, "cat": "Severe Cyclonic Storm", "dir": 355.0, "spd": 16.0, "fc": False, "r34": [150, 120, 85, 110]},
            {"dt": "2024-05-26T15:00:00Z", "lat": 21.7, "lon": 89.2, "wind": 120.0, "kts": 65.0, "p": 978.0, "cat": "Severe Cyclonic Storm (Landfall)", "dir": 355.0, "spd": 16.0, "fc": False, "r34": [160, 130, 90, 120]},
            {"dt": "2024-05-27T00:00:00Z", "lat": 22.8, "lon": 89.3, "wind": 85.0, "kts": 45.0, "p": 988.0, "cat": "Cyclonic Storm (Inland)", "dir": 10.0, "spd": 18.0, "fc": True, "r34": [110, 80, 50, 70]}
        ]
    }
}

class IBTrACSHistoricalProvider:
    def get_provider_name(self) -> str:
        return "IMD RSMC & NOAA IBTrACS Official Best Track Archive"

    def is_connected(self) -> bool:
        return True

    def get_historical_catalog(self) -> List[HistoricalCycloneListItem]:
        results = []
        for sid, data in HISTORICAL_STORMS_CATALOG.items():
            results.append(
                HistoricalCycloneListItem(
                    storm_id=data["storm_id"],
                    name=data["name"],
                    basin=data["basin"],
                    year=data["year"],
                    category=data["category"],
                    max_wind_kmh=data["max_wind_kmh"],
                    min_pressure_hpa=data["min_pressure_hpa"],
                    landfall_area=data["landfall_area"],
                    source=data["source"]
                )
            )
        return results

    def get_storm_data(self, storm_id: str) -> Optional[CycloneResponse]:
        raw = HISTORICAL_STORMS_CATALOG.get(storm_id)
        if not raw:
            return None

        historical_points: List[CycloneTrackPointSchema] = []
        forecast_points: List[CycloneTrackPointSchema] = []
        all_pts = raw["points"]

        # Parse track points
        current_pt = None
        for i, pt in enumerate(all_pts):
            parsed_dt = datetime.datetime.fromisoformat(pt["dt"].replace("Z", "+00:00"))
            r34 = pt.get("r34", [120, 100, 80, 100])
            schema_pt = CycloneTrackPointSchema(
                id=i + 1,
                timestamp=parsed_dt,
                latitude=pt["lat"],
                longitude=pt["lon"],
                wind_speed_kmh=pt["wind"],
                wind_speed_kts=pt["kts"],
                pressure_hpa=pt["p"],
                category=pt["cat"],
                movement_dir=pt["dir"],
                movement_speed_kmh=pt["spd"],
                is_forecast=pt["fc"],
                uncertainty_radius_km=pt.get("uncert", (i + 1) * 15.0 if pt["fc"] else 0.0),
                wind_radii=WindRadiiSchema(
                    r34_km={"ne": r34[0], "se": r34[1], "sw": r34[2], "nw": r34[3]},
                    r50_km={"ne": r34[0] * 0.55, "se": r34[1] * 0.55, "sw": r34[2] * 0.55, "nw": r34[3] * 0.55},
                    r64_km={"ne": r34[0] * 0.28, "se": r34[1] * 0.28, "sw": r34[2] * 0.28, "nw": r34[3] * 0.28}
                )
            )
            if not pt["fc"]:
                historical_points.append(schema_pt)
                current_pt = schema_pt  # Last observed point is current position
            else:
                forecast_points.append(schema_pt)

        if not current_pt and historical_points:
            current_pt = historical_points[-1]

        # Calculate forecast cone
        cone_input = [
            {
                "latitude": p.latitude,
                "longitude": p.longitude,
                "uncertainty_radius_km": p.uncertainty_radius_km,
                "lead_hours": (idx + 1) * 12
            }
            for idx, p in enumerate([current_pt] + forecast_points)
        ]
        cone = calculate_forecast_cone(cone_input)

        return CycloneResponse(
            storm_id=raw["storm_id"],
            name=raw["name"],
            basin=raw["basin"],
            year=raw["year"],
            status=raw["status"],
            max_wind_kmh=raw["max_wind_kmh"],
            min_pressure_hpa=raw["min_pressure_hpa"],
            source=raw["source"],
            is_active=False,
            current_position=current_pt,
            historical_points=historical_points,
            forecast_points=forecast_points,
            forecast_cone=cone
        )
