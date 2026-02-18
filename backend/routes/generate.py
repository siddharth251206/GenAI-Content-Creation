import os
import json
import datetime
import textstat
from textblob import TextBlob
from fastapi import APIRouter, HTTPException, Header, Depends
from firebase_admin import auth, firestore
from models.schemas import GenerateRequest, GenerateResponse, AnalyticsData, RegenerateRequest, RegenerateResponse
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

try:
    vs = VectorService()

    google_creds_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if google_creds_json:
        creds_dict = json.loads(google_creds_json)
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
    vs = None

@router.post("/generate", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest, 
    user: dict = Depends(get_current_user) 
):
    if not llm:
        raise HTTPException(status_code=500, detail="LLM not initialized")

    print(f"\n🚀 GENERATION REQUEST")
    print(f"Topic: {request.topic}")
    print(f"User: {user['uid']}")

    try:
        relevant_docs = []
        if vs:
            retriever = vs.get_retriever(namespace=user['uid'], k=5)
            relevant_docs = retriever.invoke(request.topic)
        
        context_text = "\n\n".join([d.page_content for d in relevant_docs])
        
        template = """
        You are an expert AI content creator.
        
        === RETRIEVED CONTEXT (From User's Knowledge Base) ===
        {context}
        ======================================================
        
        USER REQUEST:
        Topic: {topic}
        Tone / Style Description: {tone}
        Format: {content_type}
        Audience: {target_audience}
        Language: {language}

        STRICT INSTRUCTIONS:
        1. **IF the requested Format is 'LLM System Prompt' or 'AI Prompt'**:
           - Your task is to act as an Elite Prompt Engineer.
           - DO NOT write the actual content. 
           - Write a system prompt.
           
        2. **IF the requested Format is 'Midjourney Image Prompt'**:
           - Output a list of 3-5 highly descriptive image prompts.
           
        3. **FOR ALL OTHER FORMATS**:
           - Write the actual content in {language}.
           - Structure it accordingly.
        
        4. **Handling Tone**:
           - If a custom persona is provided in 'Tone', MIMIC it exactly.
           - Otherwise, use the adjective provided.
        
        5. **Context Usage**:
           - Use the 'RETRIEVED CONTEXT' to add factual accuracy and specific company details.
           - If the context is empty or irrelevant, ignore it.

        6. **Formatting**:
           - NO PREAMBLE. Start directly with the content.
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | llm | StrOutputParser()
        
        result = chain.invoke({
            "context": context_text,
            "topic": request.topic,
            "content_type": request.content_type,
            "tone": request.tone, 
            "target_audience": request.target_audience,
            "language": request.language
        })

        word_count = len(result.split())
        reading_time = max(1, round(word_count / 200)) 
        readability = textstat.flesch_reading_ease(result)
        
        blob = TextBlob(result) 
        polarity = blob.sentiment.polarity
        if polarity > 0.1: sentiment = "Positive"
        elif polarity < -0.1: sentiment = "Negative"
        else: sentiment = "Neutral"

        analytics_obj = AnalyticsData(
            word_count=word_count,
            reading_time=reading_time,
            readability_score=readability,
            sentiment=sentiment
        )

        doc_ref = db.collection("generations").document()
        doc_ref.set({
            "uid": user["uid"],     
            "topic": request.topic,
            "content_type": request.content_type,
            "tone": request.tone,
            "language": request.language, 
            "answer": result,
            "created_at": datetime.datetime.now(datetime.timezone.utc)
        })

        return GenerateResponse(answer=result, topic=request.topic,content_type=request.content_type, analytics=analytics_obj)

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