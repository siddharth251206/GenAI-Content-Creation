import os
from fastapi import APIRouter, HTTPException
from models.schemas import GenerateRequest, GenerateResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.vector_service import VectorService

router = APIRouter()

# --- INITIALIZATION ---
try:
    vs = VectorService()
    # We increase k to 5 to get more context for longer articles
    retriever = vs.vector_store.as_retriever(search_kwargs={"k": 5})
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        project=os.getenv("GOOGLE_CLOUD_PROJECT")
    )
except Exception as e:
    print(f"Server Startup Error: {e}")

# --- THE ENDPOINT ---
@router.post("/generate", response_model=GenerateResponse)
async def generate_content(request: GenerateRequest):
    print(f"Generating {request.tone} {request.content_type} about {request.topic}")
    
    try:
        # 1. Retrieve Context
        relevant_docs = retriever.invoke(request.topic)
        context_text = "\n\n".join([d.page_content for d in relevant_docs])
        
        # 2. The "Smart" Prompt
        # We inject the type, tone, and audience into the instructions
        template = """You are an expert content creator and social media manager.
        
        YOUR TASK:
        Write a {content_type} about the topic: "{topic}".
        
        GUIDELINES:
        - Tone: {tone}
        - Target Audience: {audience}
        - Use the provided context to ensure factual accuracy.
        - If writing a Tweet, keep it under 280 characters and use hashtags.
        - If writing a LinkedIn post, use professional formatting and emojis where appropriate.
        
        CONTEXT FROM DATABASE:
        {context}
        
        CONTENT:
        """
        
        prompt = ChatPromptTemplate.from_template(template)

        # 3. The Chain
        chain = prompt | llm | StrOutputParser()
        
        # 4. Invoke with ALL the variables
        result = chain.invoke({
            "context": context_text,
            "topic": request.topic,
            "content_type": request.content_type,
            "tone": request.tone,
            "audience": request.target_audience
        })

        return GenerateResponse(answer=result)

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))