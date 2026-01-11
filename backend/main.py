import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# --- 1. FIREBASE INIT ---
if not firebase_admin._apps:
    try:
        # We ONLY look for the FIREBASE_SERVICE_ACCOUNT environment variable
        firebase_val = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
        
        if firebase_val:
            # CRITICAL FIX: Check if it's actually a JSON string (starts with curly brace)
            if firebase_val.strip().startswith("{"):
                print("🔐 Detected JSON string in FIREBASE_SERVICE_ACCOUNT")
                cred_dict = json.loads(firebase_val)
                cred = credentials.Certificate(cred_dict)
            else:
                # If it doesn't start with '{', assume it's a file path string that got set
                print(f"📂 Detected path string in FIREBASE_SERVICE_ACCOUNT: {firebase_val}")
                cred = credentials.Certificate(firebase_val)

            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized successfully from ENV")
            
        else:
            print("❌ ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is missing!")
            # We do NOT fallback to serviceAccountKey.json anymore, as requested.

    except Exception as e:
        print(f"❌ Firebase Init Failed: {e}")
        # Print a snippet of the value to help debug if it fails again
        if firebase_val:
            print(f"   Value causing error (first 50 chars): {firebase_val[:50]}...")

# --- 2. IMPORT ROUTERS ---
from routes import generate, images, history

app = FastAPI()

# --- 3. CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://contentflow-genai.vercel.app" # Your Vercel URL
    ],
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