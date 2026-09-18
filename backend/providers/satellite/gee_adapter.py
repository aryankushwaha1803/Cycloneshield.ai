import os
import datetime
from typing import Dict, Any, Optional, List
from models.schemas import SatelliteLayerSchema
from config import settings

class GEEAdapter:
    def __init__(self):
        self.initialized = False
        self.error_msg: Optional[str] = None
        self._check_and_init()

    def _check_and_init(self):
        """Attempts to initialize Google Earth Engine if credentials or project are present."""
        try:
            import ee
            if settings.GEE_SERVICE_ACCOUNT_KEY_PATH and os.path.exists(settings.GEE_SERVICE_ACCOUNT_KEY_PATH):
                ee.Initialize(
                    ee.ServiceAccountCredentials(None, settings.GEE_SERVICE_ACCOUNT_KEY_PATH),
                    project=settings.GEE_PROJECT_ID
                )
                self.initialized = True
            elif settings.GEE_PROJECT_ID:
                ee.Initialize(project=settings.GEE_PROJECT_ID)
                self.initialized = True
            elif "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
                ee.Initialize()
                self.initialized = True
            else:
                self.initialized = False
                self.error_msg = "Google Earth Engine credentials not provided. Set GEE_PROJECT_ID or GEE_SERVICE_ACCOUNT_KEY_PATH in .env."
        except Exception as e:
            self.initialized = False
            self.error_msg = f"GEE Initialization failed: {str(e)}"

    def is_connected(self) -> bool:
        return self.initialized

    def get_status_info(self) -> Dict[str, Any]:
        return {
            "status": "CONNECTED" if self.initialized else "NOT_CONFIGURED",
            "provider": "Google Earth Engine Python API (ee)",
            "project_id": settings.GEE_PROJECT_ID or "Not set",
            "service_account_configured": bool(settings.GEE_SERVICE_ACCOUNT_KEY_PATH),
            "error": self.error_msg,
            "setup_guide": "To connect GEE, register at earthengine.google.com, create a service account JSON in GCP Console, and set GEE_PROJECT_ID and GEE_SERVICE_ACCOUNT_KEY_PATH in .env."
        }

    def get_layers(self, lat: float, lon: float) -> List[SatelliteLayerSchema]:
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        layers: List[SatelliteLayerSchema] = []

        if self.initialized:
            import ee
            # If GEE is connected, use real GEE map IDs
            try:
                # Sentinel-2 Multispectral
                s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
                    .filterBounds(ee.Geometry.Point([lon, lat])) \
                    .sort("CLOUDY_PIXEL_PERCENTAGE") \
                    .first()
                vis_params = {"bands": ["B4", "B3", "B2"], "min": 0, "max": 3000}
                map_id = s2.getMapId(vis_params)
                layers.append(
                    SatelliteLayerSchema(
                        id="gee-s2-harmonized",
                        name="Copernicus Sentinel-2 True Color (GEE)",
                        source="Google Earth Engine",
                        dataset_name="COPERNICUS/S2_SR_HARMONIZED",
                        timestamp=now_str,
                        status="LIVE",
                        layer_type="tile",
                        url_template=map_id["tile_fetcher"].url_format,
                        description="Real-time 10m spatial resolution multispectral optical imagery from Sentinel-2 MSI via Google Earth Engine.",
                        attribution="© European Space Agency (ESA) / Google Earth Engine"
                    )
                )

                # CHIRPS Daily Rainfall
                chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY") \
                    .filterDate((datetime.datetime.utcnow() - datetime.timedelta(days=3)).strftime("%Y-%m-%d"), datetime.datetime.utcnow().strftime("%Y-%m-%d")) \
                    .mean()
                precip_vis = {"min": 0, "max": 150, "palette": ["#ffffff", "#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000"]}
                precip_map = chirps.getMapId(precip_vis)
                layers.append(
                    SatelliteLayerSchema(
                        id="gee-chirps-precip",
                        name="CHIRPS Precipitation Extent (GEE)",
                        source="Google Earth Engine",
                        dataset_name="UCSB-CHG/CHIRPS/DAILY",
                        timestamp=now_str,
                        status="LIVE",
                        layer_type="tile",
                        url_template=precip_map["tile_fetcher"].url_format,
                        description="Climate Hazards Group InfraRed Precipitation with Station data (CHIRPS) rainfall accumulation raster via GEE.",
                        attribution="© UCSB-CHG / Google Earth Engine"
                    )
                )
                return layers
            except Exception as e:
                self.error_msg = f"Error fetching GEE tiles: {str(e)}"

        # If GEE auth is not configured, provide authentic NASA GIBS / Open satellite layers clearly tagged with provenance
        layers.append(
            SatelliteLayerSchema(
                id="nasa-gibs-modis-terra",
                name="NASA GIBS MODIS Terra Satellite Composite",
                source="NASA Global Imagery Browse Services (GIBS)",
                dataset_name="MODIS_Terra_CorrectedReflectance_TrueColor",
                timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d"),
                status="AVAILABLE",
                layer_type="tile",
                url_template="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg".replace("{time}", (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")),
                description="Daily true-color calibrated satellite observations from MODIS aboard NASA's Terra satellite.",
                attribution="© NASA GIBS / Earthdata"
            )
        )
        layers.append(
            SatelliteLayerSchema(
                id="esri-world-imagery",
                name="High-Resolution Optical Satellite Base",
                source="Maxar / Earthstar Geographics / Open GIS",
                dataset_name="World_Imagery_Clarity",
                timestamp=now_str,
                status="AVAILABLE",
                layer_type="tile",
                url_template="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                description="Sub-meter optical satellite mosaic for coastal and infrastructure ground-truth assessment.",
                attribution="© Esri, Maxar, Earthstar Geographics"
            )
        )
        layers.append(
            SatelliteLayerSchema(
                id="opentopo-dem",
                name="SRTM Digital Elevation Model (Topography)",
                source="USGS / Copernicus DEM GLO-30 Open GIS",
                dataset_name="USGS_SRTM_GLO30",
                timestamp=now_str,
                status="AVAILABLE",
                layer_type="tile",
                url_template="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                description="30m digital elevation contours for flood drainage and storm-surge coastal run-up modeling.",
                attribution="© OpenTopoMap, USGS SRTM"
            )
        )
        return layers
