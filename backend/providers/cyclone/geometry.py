import math
from typing import List, Tuple
from models.schemas import ForecastConePolygon, ConePointSchema

def calculate_forecast_cone(forecast_points: List[dict]) -> ForecastConePolygon:
    """
    Constructs a deterministic forecast cone polygon from forecast points
    using expanding uncertainty radii based on official NHC/IMD error statistics.
    """
    if not forecast_points:
        return ForecastConePolygon(cone_points=[], polygon_coordinates=[])

    cone_points: List[ConePointSchema] = []
    left_boundary: List[List[float]] = []
    right_boundary: List[List[float]] = []

    # Standard historical NHC/IMD track error radii (in km) per lead hour
    error_radii_by_lead = {
        0: 25.0,
        6: 40.0,
        12: 55.0,
        24: 85.0,
        36: 125.0,
        48: 165.0,
        72: 245.0,
        96: 340.0,
        120: 450.0
    }

    for i, pt in enumerate(forecast_points):
        lat = pt["latitude"]
        lon = pt["longitude"]
        lead_hours = pt.get("lead_hours", (i + 1) * 12)
        
        # Determine radius
        radius_km = pt.get("uncertainty_radius_km")
        if not radius_km or radius_km <= 0:
            # Interpolate or pick nearest
            radius_km = error_radii_by_lead.get(lead_hours, 50.0 + (lead_hours * 2.8))

        cone_points.append(ConePointSchema(latitude=lat, longitude=lon, radius_km=radius_km))

        # Calculate tangent normals based on track direction
        if i < len(forecast_points) - 1:
            next_pt = forecast_points[i + 1]
            dlat = next_pt["latitude"] - lat
            dlon = next_pt["longitude"] - lon
        elif i > 0:
            prev_pt = forecast_points[i - 1]
            dlat = lat - prev_pt["latitude"]
            dlon = lon - prev_pt["longitude"]
        else:
            dlat = 1.0
            dlon = 0.0

        angle = math.atan2(dlat, dlon)
        # Perpendicular angles
        left_angle = angle + math.pi / 2
        right_angle = angle - math.pi / 2

        # Convert km to degrees approximately (1 deg lat ~ 111 km, lon adjusted by cos(lat))
        km_per_deg_lat = 110.574
        km_per_deg_lon = 111.320 * math.cos(math.radians(lat))
        if abs(km_per_deg_lon) < 1e-4:
            km_per_deg_lon = 1e-4

        dlat_km = (radius_km * math.sin(left_angle)) / km_per_deg_lat
        dlon_km = (radius_km * math.cos(left_angle)) / km_per_deg_lon
        left_boundary.append([round(lon + dlon_km, 4), round(lat + dlat_km, 4)])

        dlat_km_r = (radius_km * math.sin(right_angle)) / km_per_deg_lat
        dlon_km_r = (radius_km * math.cos(right_angle)) / km_per_deg_lon
        right_boundary.append([round(lon + dlon_km_r, 4), round(lat + dlat_km_r, 4)])

    # Construct the continuous closed polygon: left boundary forward, then semicircle at the end, then right boundary backward
    # Add end semicircle
    last_pt = forecast_points[-1]
    last_radius = cone_points[-1].radius_km
    last_lat = last_pt["latitude"]
    last_lon = last_pt["longitude"]

    # Generate semicircle cap around last point
    cap_points: List[List[float]] = []
    if len(forecast_points) > 1:
        prev_pt = forecast_points[-2]
        heading = math.atan2(last_lat - prev_pt["latitude"], last_lon - prev_pt["longitude"])
    else:
        heading = 0.0

    km_per_deg_lat = 110.574
    km_per_deg_lon = 111.320 * math.cos(math.radians(last_lat))

    for step in range(13):
        theta = (heading + math.pi / 2) - (step * (math.pi / 12))
        c_lat = last_lat + (last_radius * math.sin(theta)) / km_per_deg_lat
        c_lon = last_lon + (last_radius * math.cos(theta)) / km_per_deg_lon
        cap_points.append([round(c_lon, 4), round(c_lat, 4)])

    # Combined ring
    full_polygon = left_boundary + cap_points + list(reversed(right_boundary))
    if full_polygon and full_polygon[0] != full_polygon[-1]:
        full_polygon.append(full_polygon[0])

    return ForecastConePolygon(
        cone_points=cone_points,
        polygon_coordinates=full_polygon
    )
