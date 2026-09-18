import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base

class Cyclone(Base):
    __tablename__ = "cyclones"

    id = Column(Integer, primary_key=True, index=True)
    storm_id = Column(String(64), unique=True, index=True)
    name = Column(String(128), index=True)
    basin = Column(String(64))  # e.g. NIO (North Indian Ocean), NATL, WPAC
    year = Column(Integer)
    status = Column(String(64))  # e.g. ACTIVE, HISTORICAL
    max_wind_kmh = Column(Float, default=0.0)
    min_pressure_hpa = Column(Float, default=1010.0)
    source = Column(String(128))  # e.g. "IMD RSMC", "NOAA NHC", "IBTrACS Archive"
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tracks = relationship("CycloneTrackPoint", back_populates="cyclone", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="cyclone", cascade="all, delete-orphan")


class CycloneTrackPoint(Base):
    __tablename__ = "cyclone_tracks"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"))
    timestamp = Column(DateTime, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    wind_speed_kmh = Column(Float, default=0.0)
    wind_speed_kts = Column(Float, default=0.0)
    pressure_hpa = Column(Float, default=1010.0)
    category = Column(String(64))  # e.g. "Extremely Severe Cyclonic Storm", "Cat 4"
    movement_dir = Column(Float, default=0.0)
    movement_speed_kmh = Column(Float, default=0.0)
    is_forecast = Column(Boolean, default=False)
    uncertainty_radius_km = Column(Float, default=0.0)

    # Quadrant wind radii in km (34kt, 50kt, 64kt)
    r34_ne = Column(Float, default=120.0)
    r34_se = Column(Float, default=100.0)
    r34_sw = Column(Float, default=80.0)
    r34_nw = Column(Float, default=110.0)

    r50_ne = Column(Float, default=60.0)
    r50_se = Column(Float, default=50.0)
    r50_sw = Column(Float, default=40.0)
    r50_nw = Column(Float, default=55.0)

    r64_ne = Column(Float, default=30.0)
    r64_se = Column(Float, default=25.0)
    r64_sw = Column(Float, default=20.0)
    r64_nw = Column(Float, default=25.0)

    cyclone = relationship("Cyclone", back_populates="tracks")


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(128))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(128), default="")
    temperature_c = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=0.0)
    wind_direction_deg = Column(Float, default=0.0)
    pressure_hpa = Column(Float, default=1013.25)
    rainfall_mm_24h = Column(Float, default=0.0)
    humidity_percent = Column(Float, default=0.0)
    forecast_json = Column(Text, default="{}")


class InfrastructureAsset(Base):
    __tablename__ = "infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String(64), index=True)
    name = Column(String(256))
    asset_type = Column(String(64), index=True)  # hospital, shelter, bridge, power_substation, road, telecom
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    source = Column(String(128))  # OpenStreetMap Overpass API, Regional Govt Survey
    capacity = Column(Integer, default=0)
    elevation_m = Column(Float, default=5.0)
    distance_to_coast_km = Column(Float, default=10.0)
    risk_score = Column(Float, default=0.0)
    hazards_json = Column(Text, default="[]")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    overall_risk_score = Column(Float, default=0.0)
    risk_level = Column(String(32), default="LOW")  # LOW, MODERATE, HIGH, CRITICAL
    surge_height_m = Column(Float, default=0.0)
    affected_area_km2 = Column(Float, default=0.0)
    exposed_population = Column(Integer, default=0)
    critical_facilities_exposed = Column(Integer, default=0)
    factor_breakdown_json = Column(Text, default="{}")
    evacuation_priority_json = Column(Text, default="[]")
    formula_weights_json = Column(Text, default="{}")

    cyclone = relationship("Cyclone", back_populates="risk_assessments")


class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256))
    message = Column(Text)
    recipient_group = Column(String(128))  # COASTAL_AUTHORITIES, FIRST_RESPONDERS, PUBLIC
    channel = Column(String(64))  # SMS, WEBHOOK, EMAIL, PUSH
    recipient_count = Column(Integer, default=0)
    mode = Column(String(32), default="SIMULATION")  # LIVE, SIMULATION
    provider = Column(String(128))  # Twilio SMS, Webhook Dispatcher, Simulation Recorder
    dispatched_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(32), default="DISPATCHED")
    sender_role = Column(String(64), default="DISASTER_AUTHORITY")


class SituationReport(Base):
    __tablename__ = "situation_reports"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"))
    report_title = Column(String(256))
    executive_summary = Column(Text)
    hazards_summary = Column(Text)
    infrastructure_summary = Column(Text)
    evacuation_advisories = Column(Text)
    raw_json = Column(Text, default="{}")
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    generated_by = Column(String(128), default="CycloneShield AI Automated Engine")


class DataSourceStatus(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    service_key = Column(String(64), unique=True, index=True)
    display_name = Column(String(128))
    provider_name = Column(String(128))
    endpoint_url = Column(String(256))
    status = Column(String(32))  # CONNECTED, NOT_CONFIGURED, UNAVAILABLE
    last_ping = Column(DateTime, default=datetime.datetime.utcnow)
    latency_ms = Column(Float, default=0.0)
    last_error = Column(Text, nullable=True)
    details_json = Column(Text, default="{}")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True)
    email = Column(String(128), unique=True)
    full_name = Column(String(128))
    role = Column(String(64), default="VIEWER")  # ADMIN, DISASTER_AUTHORITY, FIELD_OPERATOR, VIEWER
    is_active = Column(Boolean, default=True)
