from fastapi import APIRouter
from app.api.api_v1 import auth, chat, knowledge_base as knowledge, api_keys as api_key

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(chat.router, prefix="/chat")
api_router.include_router(knowledge.router, prefix="/knowledge_base")
api_router.include_router(api_key.router, prefix="/api_key")
