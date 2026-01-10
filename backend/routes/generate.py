import os
from fastapi import APIRouter, HTTPException
from models.schemas import GenerateRequest, GenerateResponse, RegenerateRequest, RegenerateResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.vector_service import VectorService

router = APIRouter()

try:
    vs = VectorService()
    retriever = vs.vector_store.as_retriever(search_kwargs={"k": 5})
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", project=os.getenv("GOOGLE_CLOUD_PROJECT"))
except Exception as e:
    print(f"Startup Error: {e}")

@router.post("/generate", response_model=GenerateResponse)
async def generate_content(request: GenerateRequest):
    print(f"Generating {request.topic}...")
    try:
        relevant_docs = retriever.invoke(request.topic)
        context_text = "\n\n".join([d.page_content for d in relevant_docs])
        
        template = """You are an expert content creator.
        Topic: {topic}
        Tone: {tone}
        Context: {context}
        
        Write a {content_type}. If context is irrelevant, ignore it.
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | llm | StrOutputParser()
        
        result = chain.invoke({
            "context": context_text,
            "topic": request.topic,
            "content_type": request.content_type,
            "tone": request.tone
        })

        # PASS THE TOPIC BACK
        return GenerateResponse(answer=result, topic=request.topic)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW: REGENERATE ENDPOINT ---
@router.post("/regenerate", response_model=RegenerateResponse)
async def regenerate_selection(request: RegenerateRequest):
    print(f"Regenerating text with instruction: {request.instruction}")
    
    try:
        template = """
        You are a professional editor.
        TASK: Rewrite the 'Selected Text' according to the 'Instruction'.
        
        Selected Text: "{selected_text}"
        Instruction: {instruction}
        
        Return ONLY the rewritten text. Do not add quotes or explanations.
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | llm | StrOutputParser()
        
        result = chain.invoke({
            "selected_text": request.selected_text,
            "instruction": request.instruction
        })
        
        return RegenerateResponse(updated_text=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))