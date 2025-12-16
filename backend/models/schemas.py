from pydantic import BaseModel

class GenerateRequest(BaseModel):
    topic: str

class GenerateResponse(BaseModel):
    answer: str