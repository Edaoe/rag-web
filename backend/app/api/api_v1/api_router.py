from fastapi import APIRouter
from 


api_router = APIRouter()


api_router.include_router(auth.router,prefix="/auth")
api_router.include_router(chat.router,prefix="/chat")
api_router.include_router(knowledge.router,prefix="/kownledge_base")
api_router.include_router(api_key.router,prefix="/api_key")


