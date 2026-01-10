from fastapi import APIRouter, HTTPException
from models.schemas import ImageRequest, ImageResponse
from services.image_service import ImageService
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os

router = APIRouter()
image_service = ImageService()

# Setup simple LLM for keyword extraction
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    project=os.getenv("GOOGLE_CLOUD_PROJECT")
)

@router.post("/images", response_model=ImageResponse)
async def get_related_images(request: ImageRequest):
    print(f"Fetching images for topic: {request.topic}")
    
    try:
        # 1. Ask AI for a better search query for stock photos
        # "AI in Healthcare" -> "Doctors using futuristic tablet"
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