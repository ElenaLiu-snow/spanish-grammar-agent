from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from routes.grammar import router as grammar_router
from routes.file_upload import router as file_upload_router

# 加载环境变量
load_dotenv()

# 创建 FastAPI 应用
app = FastAPI(
    title="Spanish Grammar Agent API",
    description="西语语法学习助手 API",
    version="1.0.0"
)

# 配置 CORS
frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(grammar_router)
app.include_router(file_upload_router, prefix="/api/file", tags=["file"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Spanish Grammar Agent API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/api/chat",
            "topic": "/api/topic",
            "exercise": "/api/exercise",
            "health": "/api/health"
        }
    }


@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    api_port = os.getenv("PORT") or os.getenv("BACKEND_PORT", "8001")
    print("🚀 Spanish Grammar Agent API 启动中...")
    print(f"📚 API 文档: http://localhost:{api_port}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的清理"""
    print("👋 Spanish Grammar Agent API 已关闭")


if __name__ == "__main__":
    import uvicorn
    api_port = int(os.getenv("PORT") or os.getenv("BACKEND_PORT", "8001"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=api_port,
        reload=True
    )
