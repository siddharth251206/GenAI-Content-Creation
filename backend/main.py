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
        # Check for the Environment Variable first (Render/Production)
        firebase_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
        
        if firebase_json:
            # Parse the JSON string
            cred_dict = json.loads(firebase_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized from FIREBASE_SERVICE_ACCOUNT")
        
        # Fallback to local file (Local Development)
        elif os.path.exists("serviceAccountKey.json"):
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized with serviceAccountKey.json")
            
        else:
            print("⚠️ No credentials found. Using Default...")
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)

    except Exception as e:
        print(f"❌ Firebase Init Error: {e}")

from routes import generate, images, history

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://contentflow-genai.vercel.app"
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