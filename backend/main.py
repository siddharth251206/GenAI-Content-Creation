from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import the router we just built
from routes import generate

load_dotenv()

app = FastAPI()

# --- CORS (Security) ---
# Browsers block websites from talking to random servers by default.
# We must explicitly say: "I allow localhost:3000 (Next.js) to talk to me."
origins = [
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all types (GET, POST, etc.)
    allow_headers=["*"],
)

# --- PLUGGING IN ---
# This line says: "Take all the URLs defined in 'generate.py' and add them to the app."
# prefix="/api" means the URL will be: http://localhost:8000/api/generate
app.include_router(generate.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "The GenAI Brain is Online 🧠"}