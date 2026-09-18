import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from config import settings
from services.infrastructure_service import infrastructure_service
from api import (
    system_router,
    cyclone_router,
    weather_router,
    satellite_router,
    infrastructure_router,
    risk_router,
    ai_router,
    alerts_router,
    reports_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        infrastructure_service.seed_infrastructure(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CycloneShield AI API",
    description="Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster — Real-Data Disaster Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(system_router, prefix="/api")
app.include_router(cyclone_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(satellite_router, prefix="/api")
app.include_router(infrastructure_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "platform": "CycloneShield AI",
        "subtitle": "Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster",
        "version": "1.0.0",
        "system_status": "/api/system/status",
        "docs": "/docs",
        "status": "OPERATIONAL"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
