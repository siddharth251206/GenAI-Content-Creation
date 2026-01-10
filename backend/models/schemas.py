from pydantic import BaseModel, Field
from typing import Optional, List

# --- GENERATE ---
class GenerateRequest(BaseModel):
    topic: str = Field(..., description="The main subject of the content")
    content_type: str = Field(default="blog post", description="Type of content")
    tone: str = Field(default="professional", description="Tone of voice")
    target_audience: Optional[str] = Field(default="general audience")

class GenerateResponse(BaseModel):
    answer: str
    topic: str  # Added this so the frontend knows what to search images for

# --- IMAGES ---
class ImageRequest(BaseModel):
    topic: str

class ImageResponse(BaseModel):
    images: List[str]  # List of image URLs

# --- REGENERATE ---
class RegenerateRequest(BaseModel):
    selected_text: str
    instruction: str  # e.g., "Make it funnier", "Expand", "Rewrite"
    context: Optional[str] = "" # Surrounding text for context

class RegenerateResponse(BaseModel):
    updated_text: str