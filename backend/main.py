import os
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# --- 1. FIREBASE INIT (MUST BE FIRST) ---
if not firebase_admin._apps:
    try:
        # Try service account first (Best for History/DB access)
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized with serviceAccountKey.json")
    except Exception:
        # Fallback to default
        print("🔄 Using Default Credentials...")
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)

# --- 2. IMPORT ROUTERS (MUST BE AFTER INIT) ---
# 🚨 If you import these at the top, the app crashes!
from routes import generate, images, history

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(history.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "GenAI Brain Online 🧠"}