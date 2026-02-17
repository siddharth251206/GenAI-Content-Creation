import os
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Depends
from firebase_admin import auth
from services.vector_service import VectorService
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

router = APIRouter()

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
except Exception as e:
    print(f"Vector Service Error: {e}")
    vs = None

@router.post("/knowledge/upload")
async def upload_knowledge(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    Uploads a PDF or TXT file, chunks it, and stores it in Pinecone 
    under the user's specific namespace.
    """
    if not vs:
        raise HTTPException(status_code=500, detail="Vector Service not initialized")

    filename = file.filename
    content_type = file.content_type
    print(f"📂 User {user['uid']} uploading: {filename} ({content_type})")

    try:
        text_content = ""

        if content_type == "application/pdf":
            pdf_bytes = await file.read()
            pdf_file = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text_content += page.extract_text() + "\n"
        
        elif content_type in ["text/plain", "text/markdown"]:
            content_bytes = await file.read()
            text_content = content_bytes.decode("utf-8")
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF or TXT.")

        if not text_content.strip():
            raise HTTPException(status_code=400, detail="File is empty or text could not be extracted.")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        texts = text_splitter.split_text(text_content)
        
        print(f"✂️ Split document into {len(texts)} chunks.")

        vs.add_texts(texts, namespace=user['uid'])

        return {
            "status": "success", 
            "filename": filename, 
            "chunks_added": len(texts),
            "message": "Knowledge added to your brain successfully! 🧠"
        }

    except Exception as e:
        print(f"❌ Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))