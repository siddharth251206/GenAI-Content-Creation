from fastapi import APIRouter, Query
from models.schemas import ImageRequest, ImageResponse
from services.image_service import ImageService

router = APIRouter()
image_service = ImageService()

@router.post("/images", response_model=ImageResponse)
async def get_related_images(request: ImageRequest, page: int = Query(1, ge=1)):
    """
    Fetch related images with pagination support.
    """
    print(f"Received image request for topic: {request.topic} (Page: {page})")
    
    try:
        urls = image_service.get_images(request.topic, page=page)
        return ImageResponse(images=urls)
    except Exception as e:
        print(f"Error in get_related_images endpoint: {e}")
        return ImageResponse(images=[])