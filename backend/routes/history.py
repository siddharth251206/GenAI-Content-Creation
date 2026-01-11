from fastapi import APIRouter, HTTPException, Header, Depends
from firebase_admin import auth, firestore
from typing import List, Optional
from models.schemas import HistoryItem

router = APIRouter()
db = firestore.client()

# --- Auth Dependency ---
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split("Bearer ")[1]
    try:
        return auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.get("/history", response_model=List[HistoryItem])
async def get_history(user: dict = Depends(get_current_user)):
    try:
        docs = (
            db.collection("generations")
            .where("uid", "==", user["uid"])
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(20) # 👈 FIXED: Limit to last 20 items for speed
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
        return []

@router.delete("/history/{doc_id}")
async def delete_history_item(doc_id: str, user: dict = Depends(get_current_user)):
    try:
        doc_ref = db.collection("generations").document(doc_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Item not found")

        if doc.to_dict().get("uid") != user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        doc_ref.delete()
        return {"status": "success"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete item")