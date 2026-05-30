from fastapi import FastAPI

from .app.main import app as main_app

# Vercel serverless function entry point.
app = FastAPI()
app.mount("/api", main_app)
