import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

if not firebase_admin._apps:
    try:
        firebase_val = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
        
        if firebase_val:
            if firebase_val.strip().startswith("{"):
                print("🔐 Detected JSON string in FIREBASE_SERVICE_ACCOUNT")
                cred_dict = json.loads(firebase_val)
                cred = credentials.Certificate(cred_dict)
            else:
                print(f"📂 Detected path string in FIREBASE_SERVICE_ACCOUNT: {firebase_val}")
                cred = credentials.Certificate(firebase_val)

            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized successfully from ENV")
            
        else:
            print("❌ ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is missing!")

    except Exception as e:
        print(f"❌ Firebase Init Failed: {e}")
        if firebase_val:
            print(f"   Value causing error (first 50 chars): {firebase_val[:50]}...")

from routes import generate, images, history

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
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