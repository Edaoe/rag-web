from pydantic import BaseSettings

class Settings(BaseSettings):
    projuct_name: str = "RAG-Web"   # 项目名称
    version: str = "0.1.0"  # 项目版本
    api_prefix: str = "/api/v2"   # 接口前缀



settings = Settings()
