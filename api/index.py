"""
Vercel Serverless Function - Main API Entry Point
Adapte le backend FastAPI pour Vercel
"""
import os
import sys
import json
import logging
from datetime import datetime

# Ajouter py_backend au path pour les imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'py_backend'))

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vercel-api")

# Setup FastAPI
app = FastAPI(
    title="Clara Backend API - Vercel",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store start time
START_TIME = datetime.now().isoformat()

@app.get("/api")
@app.get("/api/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Clara Backend API running on Vercel",
        "version": "1.0.0",
        "started_at": START_TIME,
        "environment": "vercel"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": True,
            "pandas_api": True,
            "word_export": True
        }
    }

# Import routers from py_backend
try:
    from pandas_api import router as pandas_router
    app.include_router(pandas_router, prefix="/api")
    logger.info("✅ Pandas API router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Pandas API not available: {e}")

try:
    from word_export import router as word_router
    app.include_router(word_router, prefix="/api")
    logger.info("✅ Word Export router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Word Export not available: {e}")

try:
    from pandas_lead import router as lead_router
    app.include_router(lead_router, prefix="/api")
    logger.info("✅ Lead Balance router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Lead Balance not available: {e}")

try:
    from etats_financiers import router as etats_router
    app.include_router(etats_router, prefix="/api")
    logger.info("✅ États Financiers router loaded")
except ImportError as e:
    logger.warning(f"⚠️ États Financiers not available: {e}")

try:
    from echantillonnage import router as echantillonnage_router
    app.include_router(echantillonnage_router, prefix="/api")
    logger.info("✅ Échantillonnage router loaded")
except ImportError as e:
    logger.warning(f"⚠️ Échantillonnage not available: {e}")

# Handler pour Vercel
handler = Mangum(app, lifespan="off")
