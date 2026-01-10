import os
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import routers
from routes import generate, images, history  # <--- Import history

load_dotenv()

# --- FIREBASE INIT ---
# Ensure you have your serviceAccountKey.json path in .env or use default google credentials
# For local dev, explicit path is often easiest: cred = credentials.Certificate("path/to/key.json")
try:
    firebase_admin.get_app()
except ValueError:
    # Use default credentials (works if logged in via gcloud CLI) or explicit service account
    cred = credentials.ApplicationDefault() 
    firebase_admin.initialize_app(cred)

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plug in routes
app.include_router(generate.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(history.router, prefix="/api") # <--- Add history router

@app.get("/")
def read_root():
    return {"status": "GenAI Brain Online 🧠"}