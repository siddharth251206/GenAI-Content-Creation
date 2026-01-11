from fastapi import APIRouter, HTTPException
from models.schemas import ImageRequest, ImageResponse
from services.image_service import ImageService
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
import json # <--- ADDED
from google.oauth2 import service_account # <--- ADDED

router = APIRouter()
image_service = ImageService()

# --- AUTH SETUP (Fixing the "File not found" error) ---
try:
    # 1. Get the JSON string
    google_creds_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    
    if google_creds_json:
        # 2. Parse JSON
        creds_dict = json.loads(google_creds_json)
        
        # 3. Create Credentials with Scope
        creds = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        
        # 4. Pass credentials explicitly
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            credentials=creds # <--- This prevents the crash
        )
    else:
        print("WARNING: GOOGLE_APPLICATION_CREDENTIALS not found for images.py")
        llm = None

except Exception as e:
    print(f"Error initializing Image LLM: {e}")
    llm = None


@router.post("/images", response_model=ImageResponse)
async def get_related_images(request: ImageRequest):
    print(f"Fetching images for topic: {request.topic}")
    
    if not llm:
        print("LLM not initialized, skipping AI search term generation.")
        # Fallback: Just search using the topic directly
        urls = image_service.get_images(request.topic)
        return ImageResponse(images=urls)
    
    try:
        # 1. Ask AI for a better search query for stock photos
        prompt = ChatPromptTemplate.from_template(
            "Give me ONE specific, visual search query to find a stock photo for the topic: '{topic}'. "
            "Output ONLY the search term, nothing else. Example: 'Office meeting', 'Futuristic City'."
        )
        chain = prompt | llm | StrOutputParser()
        search_term = chain.invoke({"topic": request.topic})
        
        print(f"AI suggested search term: {search_term}")

        # 2. Fetch from Pexels
        urls = image_service.get_images(search_term.strip())
        
        return ImageResponse(images=urls)

    except Exception as e:
        print(f"Image Error: {e}")
        # Return empty list instead of crashing
        return ImageResponse(images=[])