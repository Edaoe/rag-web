from fastapi import FastAPI
from app.core.config import Settings
from app.api.api_v1 import api_router, openapi_router
from app.api.api_v1 import auth, users  # 成员二模块

app = FastAPI(
    title=Settings.projuct_name,
    version=Settings.version,
    openapi_url=Settings.api_prefix + "/openapi.json"
)

# 挂载原有路由组
app.include_router(api_router, prefix=Settings.api_prefix)
app.include_router(openapi_router, prefix="/openapi")

# 挂载成员二模块
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])


# 根路由
@app.get("/")
async def root():
    return {"message": "welcome to RAG-Web"}


# 健康检查路由
@app.get(Settings.api_prefix + "/health")
async def health():
    return {"status": "healthy", "version": Settings.version}
