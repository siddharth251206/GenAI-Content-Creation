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
        
        # 2. SELECT PROMPT
        if request.content_type.lower().strip() == "code":
            # (Developer Persona - kept clean)
            template = """You are a Senior Software Engineer.
            TASK: Write code for: "{topic}".
            Tone: {tone}
            INSTRUCTION: Provide ONLY code and technical explanation. Ignore context if it's not technical documentation. 
            CONTEXT: {context}
            CODE:"""
        else:
            # --- SOCIAL MEDIA PERSONA (UPDATED) ---
            template = """You are an expert content creator.
            
            YOUR TASK:
            Write a {content_type} about the topic: "{topic}".
            
            CRITICAL INSTRUCTION ON CONTEXT:
            I have provided some context below from a knowledge base.
            1. Analyze the Context.
            2. If the Context is about a SPECIFIC person/project (e.g., Siddharth) and the Topic is UNRELATED (e.g., Andrew Tate, Elon Musk, General History), **IGNORE THE CONTEXT COMPLETELY**.
            3. Only use the context if it matches the user's topic.
            
            Tone: {tone}
            Audience: {audience}
            
            CONTEXT:
            {context}
            
            CONTENT:
            """
        
        prompt = ChatPromptTemplate.from_template(template)

        # 3. The Chain
        chain = prompt | llm | StrOutputParser()
        
        # 4. Invoke
        result = chain.invoke({
            "context": context_text,
            "topic": request.topic,
            "content_type": request.content_type,
            "tone": request.tone,
            "audience": request.target_audience
        })

        # No DB saving here since you haven't set it up yet
        return GenerateResponse(answer=result)

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))