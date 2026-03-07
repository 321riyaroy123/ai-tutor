from fastapi import FastAPI 
from .app.main import app as main_app # Vercel Serverless Function entry point 

app = FastAPI() 
app.mount("/api", main_app)