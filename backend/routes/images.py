from fastapi import APIRouter, HTTPException
from models.schemas import ImageRequest, ImageResponse
from services.image_service import ImageService

router = APIRouter()
image_service = ImageService()

@router.post("/images", response_model=ImageResponse)
async def get_related_images(request: ImageRequest):
    print(f"Received image request for topic: {request.topic}")
    
    # Delegate to the service. 
    # The service now handles:
    # 1. LLM initialization (with correct creds)
    # 2. Query refinement (Topic -> Search Term)
    # 3. Pexels API fetching
    try:
        urls = image_service.get_images(request.topic)
        return ImageResponse(images=urls)
    except Exception as e:
        print(f"Error in get_related_images endpoint: {e}")
        # Return empty list gracefully if something fails
        return ImageResponse(images=[])