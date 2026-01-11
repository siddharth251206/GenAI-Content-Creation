import os
import datetime
from fastapi import APIRouter, HTTPException, Header, Depends
from firebase_admin import auth, firestore
from models.schemas import GenerateRequest, GenerateResponse, RegenerateRequest, RegenerateResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.vector_service import VectorService

router = APIRouter()
db = firestore.client()

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid header")
    token = authorization.split("Bearer ")[1]
    try:
        return auth.verify_id_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

try:
    vs = VectorService()
    retriever = vs.vector_store.as_retriever(search_kwargs={"k": 5})
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", project=os.getenv("GOOGLE_CLOUD_PROJECT"))
except Exception as e:
    print(f"Startup Error: {e}")

@router.post("/generate", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest, 
    user: dict = Depends(get_current_user) 
):
    print(f"Generating {request.topic} for user {user['uid']}...")
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

        doc_ref = db.collection("generations").document()
        doc_ref.set({
            "uid": user["uid"],
            "topic": request.topic,
            "content_type": request.content_type,
            "tone": request.tone,
            "answer": result,
            "created_at": datetime.datetime.now(datetime.timezone.utc)
        })

        return GenerateResponse(answer=result, topic=request.topic)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
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