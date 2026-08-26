from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import generate_chat_response
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("", response_model=ChatResponse)
def handle_chat(
    chat_req: ChatRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Delegate to the AI service
    reply = generate_chat_response(chat_req.message, db)
    return ChatResponse(response=reply)
