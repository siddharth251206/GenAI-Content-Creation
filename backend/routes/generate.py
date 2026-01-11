import os
import json
import datetime
from fastapi import APIRouter, HTTPException, Header, Depends
from firebase_admin import auth, firestore
from models.schemas import GenerateRequest, GenerateResponse, RegenerateRequest, RegenerateResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.vector_service import VectorService
from google.oauth2 import service_account

router = APIRouter()
db = firestore.client()

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid header")
    token = authorization.split("Bearer ")[1]
    try:
        return auth.verify_id_token(token)
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

# --- INITIALIZE SERVICES ---
try:
    # 1. Vector Service
    vs = VectorService()
    retriever = vs.vector_store.as_retriever(search_kwargs={"k": 5})

    # 2. Gemini Chat Model (With Manual Auth & Scope Fix)
    google_creds_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if google_creds_json:
        creds_dict = json.loads(google_creds_json)
        
        # 🚨 FIX: Add the scope here!
        creds = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            credentials=creds
        )
    else:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS missing for Gemini")
        llm = None

except Exception as e:
    print(f"Startup Error: {e}")

@router.post("/generate", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest, 
    user: dict = Depends(get_current_user) 
):
    if not llm:
        raise HTTPException(status_code=500, detail="LLM not initialized")

    print(f"Generating {request.topic} for user {user['uid']}...")
    try:
        # Retrieve context (May include irrelevant files)
        relevant_docs = retriever.invoke(request.topic)
        context_text = "\n\n".join([d.page_content for d in relevant_docs])
        
        # --- 🚨 PROMPT FIX TO IGNORE BAD CONTEXT 🚨 ---
        template = """You are an expert content creator.
        
        === RETRIEVED CONTEXT (May be irrelevant) ===
        {context}
        =============================================
        
        USER REQUEST:
        Topic: {topic}
        Tone: {tone}
        Format: {content_type}
        
        STRICT INSTRUCTIONS:
        1. Analyze the 'RETRIEVED CONTEXT'. 
        2. If the context is NOT directly related to the Topic (e.g., if it's about software code, project settings, or 'Siddharth'), IGNORE IT COMPLETELY.
        3. Write a high-quality {content_type} based on the topic.
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
    if not llm:
        raise HTTPException(status_code=500, detail="LLM not initialized")
        
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