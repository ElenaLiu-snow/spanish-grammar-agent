from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
from services.claude import get_claude_service
from services.knowledge import get_knowledge_base
import json
import re


router = APIRouter(prefix="/api", tags=["grammar"])


def clean_markdown_tables(content: str) -> str:
    """
    清理 Markdown 表格格式，确保正确解析

    移除表格行末尾的空格和多余空格
    """
    # 移除表格行末尾的空格（以 | 开头的行）
    lines = content.split('\n')
    cleaned_lines = []

    for line in lines:
        # 如果是表格行（包含 | ），移除末尾空格
        if '|' in line and line.strip().endswith('|'):
            cleaned_lines.append(line.rstrip())
        else:
            cleaned_lines.append(line)

    return '\n'.join(cleaned_lines)


class ChatRequest(BaseModel):
    """聊天请求模型"""
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None
    mode: str = "auto"  # auto=自动检测, coach/drill/correction/oral/culture=手动选择
    stream: bool = True


class TopicRequest(BaseModel):
    """语法点解析请求"""
    topic: str
    level: Optional[str] = None  # A1, A2, B1, B2, C1, C2


class ExerciseRequest(BaseModel):
    """练习生成请求"""
    topic: str
    level: str = "B1"  # 默认中级
    count: int = 5  # 题目数量
    exercise_type: Optional[str] = None  # 填空、选择、改错、翻译


@router.post("/chat")
async def chat(request: ChatRequest):
    """对话接口 - 支持流式和非流式响应

    Args:
        request: 包含消息、对话历史、模式和是否流式的请求

    Returns:
        流式响应返回 SSE 流，非流式返回 JSON
    """
    try:
        claude_service = get_claude_service()

        # 自动模式检测
        mode = request.mode
        if not mode or mode == "auto":
            mode = claude_service.auto_detect_mode(request.message)

        # RAE 知识库检索
        try:
            knowledge_base = get_knowledge_base()
            rae_context = knowledge_base.retrieve(request.message)
        except Exception:
            rae_context = ""

        if request.stream:
            # 流式响应 (Server-Sent Events)
            async def generate():
                async for chunk in claude_service.chat(
                    message=request.message,
                    conversation_history=request.conversation_history,
                    mode=mode,
                    rae_context=rae_context,
                    stream=True
                ):
                    # SSE 格式
                    yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
                # 发送结束标记
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        else:
            # 非流式响应
            response = await claude_service.chat_complete(
                message=request.message,
                conversation_history=request.conversation_history,
                mode=mode,
                rae_context=rae_context,
            )
            return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topic")
async def analyze_topic(request: TopicRequest):
    """深度解析语法点（兼容端点，内部使用 drill 模式）

    Args:
        request: 包含语法点主题和级别的请求

    Returns:
        流式响应，返回系统化的语法点解析
    """
    try:
        claude_service = get_claude_service()

        prompt = request.topic
        if request.level:
            prompt = f"难度级别：{request.level}\n\n请系统梳理：{request.topic}"

        async def generate():
            async for chunk in claude_service.chat(
                message=prompt,
                mode="drill",
                stream=True
            ):
                yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exercise")
async def generate_exercise(request: ExerciseRequest):
    """生成练习题（兼容端点，内部使用 drill 模式）

    Args:
        request: 包含主题、级别、数量、类型的请求

    Returns:
        流式响应，返回练习题和答案解析
    """
    try:
        claude_service = get_claude_service()

        prompt = f"主题：{request.topic}\n难度级别：{request.level}\n题目数量：{request.count}题"
        if request.exercise_type:
            prompt += f"\n题型：{request.exercise_type}"

        async def generate():
            async for chunk in claude_service.chat(
                message=prompt,
                mode="drill",
                stream=True
            ):
                yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "ok", "service": "Spanish Grammar Agent API"}
