from pydantic import BaseModel, Field
from typing import Optional

class GenerateRequest(BaseModel):
    topic: str = Field(..., description="The main subject of the content")
    
    # New Fields with default values
    content_type: str = Field(default="blog post", description="Type of content: tweet, linkedin post, blog, etc.")
    tone: str = Field(default="professional", description="The tone of voice: funny, serious, casual, etc.")
    
    # Optional: Target Audience
    target_audience: Optional[str] = Field(default="general audience", description="Who is reading this?")

class GenerateResponse(BaseModel):
    answer: str