from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class GenerateRequest(BaseModel):
    topic: str = Field(..., description="The main subject of the content")
    content_type: str = Field(default="blog post", description="Type of content")
    tone: str = Field(default="professional", description="Tone of voice")
    target_audience: Optional[str] = Field(default="general audience")
    language: str = Field(default="English", description="Language of Content")

class AnalyticsData(BaseModel):
    word_count: int
    reading_time: int
    readability_score: float
    sentiment: str

class GenerateResponse(BaseModel):
    answer: str
    topic: str 
    content_type: Optional[str] = "blog post"
    analytics: Optional[AnalyticsData] = None

class HistoryItem(BaseModel):
    id: str
    topic: str
    content_type: str
    created_at: datetime
    answer: str

class ImageRequest(BaseModel):
    topic: str

class ImageResponse(BaseModel):
    images: List[str] 

class RegenerateRequest(BaseModel):
    selected_text: str
    instruction: str  
    context: Optional[str] = "" 

class RegenerateResponse(BaseModel):
    updated_text: str