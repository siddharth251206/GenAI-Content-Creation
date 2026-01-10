from fastapi import APIRouter, HTTPException, Header, Depends
from firebase_admin import auth, firestore
from typing import List, Optional
from models.schemas import HistoryItem

router = APIRouter()
db = firestore.client()

# Dependency to verify Firebase Token
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token # Returns dict with 'uid', 'email', etc.
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.get("/history", response_model=List[HistoryItem])
async def get_history(user: dict = Depends(get_current_user)):
    try:
        # Query Firestore: collection 'generations', where 'uid' matches, order by date
        docs = (
            db.collection("generations")
            .where("uid", "==", user["uid"])
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .stream()
        )
        
        history_list = []
        for doc in docs:
            data = doc.to_dict()
            history_list.append(HistoryItem(
                id=doc.id,
                topic=data.get("topic", "Unknown"),
                content_type=data.get("content_type", "Unknown"),
                answer=data.get("answer", ""),
                created_at=data.get("created_at")
            ))
            
        return history_list
    except Exception as e:
        print(f"History Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")