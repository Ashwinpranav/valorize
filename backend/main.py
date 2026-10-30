from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api import (
    auth, listings, ai, requirements, matches, enquiries, transactions, reports, notifications, admin
)
from app.services.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial demo data if database is fresh
    db = SessionLocal()
    try:
        seed_database(db, reset=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Valorize — B2B AI-Powered Industrial Waste Exchange Platform with Automated Classification, Valuation & Circular Matching",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all for seamless pairing with frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount frontend public images directory for category visuals
frontend_images = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "images"))
if os.path.exists(frontend_images):
    app.mount("/images", StaticFiles(directory=frontend_images), name="frontend_images")

# Include Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(listings.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(requirements.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)
app.include_router(enquiries.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "demo_mode": settings.DEMO_MODE
    }

# SPA Frontend Integration (Serves built React application from frontend/dist)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API, docs, uploads, and health endpoints to pass through without interception
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path.startswith("uploads"):
            raise HTTPException(status_code=404, detail="Endpoint not found")

        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": "1.0.0",
            "docs": "/docs",
            "api_v1": settings.API_V1_STR,
            "status": "operational",
            "frontend": "Frontend distribution not found. Run 'npm run build' inside frontend/"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

