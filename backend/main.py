from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import routers
from routes import generate, images  # <--- Import images

load_dotenv()

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
app.include_router(images.router, prefix="/api") # <--- Add this line

@app.get("/")
def read_root():
    return {"status": "GenAI Brain Online 🧠"}