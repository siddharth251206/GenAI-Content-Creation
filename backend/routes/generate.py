import os
from fastapi import APIRouter, HTTPException
from models.schemas import GenerateRequest, GenerateResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from services.vector_service import VectorService

router = APIRouter()
try:
    vs= VectorService()
    retriever= vs.vector_store.as_retriever(search_kwargs={"k":3})
    llm = ChatGoogleGenerativeAI(
        model ="gemini-2.5-flash",
        project = os.getenv("GOOGLE-CLOUD-PROJECT")
    )
except Exception as e:
    print(f"Server startup error: {e}")

@router.post("/generate", response_model=GenerateResponse)
async def generate_content(request: GenerateRequest):
    print(f"Request recieved for topic: {request.topic}")
    try:
        template = """You are a helpful assistant. 
        Context: {context}
        Question: {topic}
        """
        prompt = ChatPromptTemplate.from_template(template)
        relevant_docs = retriever.invoke(request.topic)
        
        # Combine docs into one big string
        context_text = "\n\n".join([d.page_content for d in relevant_docs])
        
        # Feed it to the chain
        chain = prompt | llm | StrOutputParser()
        result = chain.invoke({"context": context_text, "topic": request.topic})

        # 4. Return it using the Output Contract
        return GenerateResponse(answer=result)

    except Exception as e:
        print(f"Error: {e}")
        # Send a proper error code (500) to the frontend
        raise HTTPException(status_code=500, detail=str(e))        