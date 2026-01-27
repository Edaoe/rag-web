from fastapi import FastAPI
from app.core.config import Settings

app = FastAPI(
    title = Settings.projuct_name,
    version = Settings.version,
    openapi_url = Settings.api_prefix + "/openapi.json"
)


#  挂载api和openapi两个路由组
app.include_router(api_router,prifix=Settings.api_prefix)
app.include_router(openapi_router,prifix="/openapi")



"""
根路由，快速验证服务是否启动成功
"""
@app.get("/")
async def root():
    return {"message":"welcome to RAG-Web"}



"""
健康检查路由，返回版本号便于排查部署是不是更新了。
"""
@app.get("/health",prefix=Settings.api_prefix)
async def health():
    return {"status":"healthy","version":"Setting.version"}

