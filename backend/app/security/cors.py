from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

def add_cors_middleware(app: FastAPI) -> None:
    """
    Add CORS middleware to FastAPI app.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 原项目默认允许全部，可后续修改
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
