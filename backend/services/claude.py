import anthropic
import openai
from typing import AsyncGenerator, List, Dict, Any, Union
import os
from pathlib import Path
from enum import Enum


class Provider(Enum):
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"


class ClaudeService:
    """LLM API 服务封装，用于西语语法学习"""

    def __init__(self, api_key: str = None, base_url: str = None):
        """初始化 LLM 服务

        Args:
            api_key: API key，如果为 None 则从环境变量读取
            base_url: API 基础 URL，支持代理地址
        """
        # 确定提供商
        self.provider = os.getenv("LLM_PROVIDER", "anthropic").lower()

        if self.provider == Provider.DEEPSEEK.value:
            # DeepSeek 配置 (OpenAI 兼容)
            if api_key is None:
                api_key = os.getenv("DEEPSEEK_API_KEY")
                if not api_key:
                    raise ValueError("请设置 DEEPSEEK_API_KEY 环境变量")

            if base_url is None:
                base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

            # 创建 OpenAI 兼容客户端
            client_kwargs = {"api_key": api_key}
            if base_url:
                client_kwargs["base_url"] = base_url

            self.client = openai.AsyncOpenAI(**client_kwargs)
            self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
            self.client_type = "openai"

        else:  # 默认为 Anthropic
            # Anthropic 配置
            if api_key is None:
                api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")
                if not api_key:
                    raise ValueError("请设置 ANTHROPIC_API_KEY 或 ANTHROPIC_AUTH_TOKEN 环境变量")

            if base_url is None:
                base_url = os.getenv("ANTHROPIC_BASE_URL")

            # 创建 Anthropic 客户端
            client_kwargs = {"api_key": api_key}
            if base_url:
                client_kwargs["base_url"] = base_url

            self.client = anthropic.AsyncAnthropic(**client_kwargs)
            self.model = os.getenv("ANTHROPIC_MODEL", "claude-3.5-sonnet-20241022")
            self.client_type = "anthropic"

        # 加载系统提示词
        self._prompt_cache = {}
        self._prompt_dir = Path(__file__).parent.parent / "prompts"

    def _load_system_prompt(self, mode: str = "coach") -> str:
        """加载系统提示词：_base.txt + {mode}.txt，带缓存

        Args:
            mode: 模式名称 (coach/drill/correction/oral/culture)

        Returns:
            拼接后的完整系统提示词
        """
        if mode in self._prompt_cache:
            return self._prompt_cache[mode]

        # 加载 _base.txt
        base_path = self._prompt_dir / "_base.txt"
        try:
            base = base_path.read_text(encoding="utf-8")
        except FileNotFoundError:
            base = ""

        # 加载模式特定 prompt
        mode_path = self._prompt_dir / f"{mode}.txt"
        try:
            mode_specific = mode_path.read_text(encoding="utf-8")
        except FileNotFoundError:
            # fallback 到 legacy system.txt
            legacy_path = self._prompt_dir / "system.txt"
            if legacy_path.exists():
                combined = legacy_path.read_text(encoding="utf-8")
            elif base:
                combined = base  # 只有 base，没有 mode prompt
            else:
                combined = "你是西语语法专家助手，严格遵循 RAE 标准回答语法问题。输出使用 Markdown 格式。"
            self._prompt_cache[mode] = combined
            return combined

        if base:
            combined = base + "\n\n" + mode_specific
        else:
            combined = mode_specific

        self._prompt_cache[mode] = combined
        return combined

    def auto_detect_mode(self, message: str) -> str:
        """根据用户输入自动判断应该用哪个模式

        Args:
            message: 用户消息

        Returns:
            匹配的模式名称
        """
        msg = message.lower()

        # 规划类 → coach
        coach_keywords = ["计划", "规划", "安排", "分钟", "今天练", "每日", "怎么复习",
                          "怎么学", "学习路径", "备考", "时间", "薄弱"]
        if any(w in msg for w in coach_keywords):
            return "coach"

        # 出题类 → drill
        drill_keywords = ["出题", "出几道", "出一组", "填空题", "选择题", "练习",
                          "生成题目", "给我几道", "来几道", "做几道", "帮我出",
                          "练介词", "练时态", "练动词", "练冠词"]
        if any(w in msg for w in drill_keywords):
            return "drill"

        # 批改类 → correction
        correction_keywords = ["批改", "改错", "纠正", "帮我看看", "对不对", "错在哪",
                               "帮我检查", "有没有错", "哪里不对", "订正", "修改"]
        if any(w in msg for w in correction_keywords):
            return "correction"

        # 口语类 → oral
        oral_keywords = ["口语", "怎么说", "对话", "俚语", "日常用", "地道",
                         "怎么表达", "口头", "聊天时", "朋友之间", "pa'", "缩写"]
        if any(w in msg for w in oral_keywords):
            return "oral"

        # 文化类 → culture
        culture_keywords = ["文化", "节日", "习俗", "历史背景", "地区差异", "传统",
                            "圣诞", "新年", "亡灵节", "斗牛", "弗拉明戈", "tapas",
                            "为什么这样说", "这个词的来历", "语源"]
        if any(w in msg for w in culture_keywords):
            return "culture"

        # 默认 → coach（综合性的学习助手）
        return "coach"

    def _build_messages(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
    ) -> List[Dict[str, str]]:
        """构建消息列表（不再拼接 mode 前缀，模式行为由 system prompt 定义）

        Args:
            user_message: 用户消息
            conversation_history: 对话历史

        Returns:
            消息列表
        """
        messages = []

        # 添加对话历史（如果有）
        if conversation_history:
            messages.extend(conversation_history)

        messages.append({"role": "user", "content": user_message})

        return messages

    async def chat(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None,
        mode: str = "coach",
        rae_context: str = "",
        stream: bool = True
    ) -> AsyncGenerator[str, None]:
        """与 LLM 对话

        Args:
            message: 用户消息
            conversation_history: 对话历史，格式为 [{"role": "user", "content": "..."}, ...]
            mode: 模式 (coach/drill/correction/oral/culture)
            rae_context: RAE 知识库检索到的参考内容
            stream: 是否使用流式响应

        Yields:
            LLM 的响应内容（流式）
        """
        messages = self._build_messages(message, conversation_history)
        system_prompt = self._load_system_prompt(mode)

        # 拼接 RAE 知识库参考内容
        if rae_context:
            system_prompt = system_prompt + "\n\n## RAE 语法参考\n\n以下是从 RAE 官方语法知识库中检索到的相关内容，请在回答时参考：\n\n" + rae_context

        try:
            if self.client_type == "anthropic":
                if stream:
                    # Anthropic 流式响应
                    stream_obj = self.client.messages.stream(
                        model=self.model,
                        max_tokens=16384,
                        system=system_prompt,
                        messages=messages,
                    )
                    async with stream_obj as stream_manager:
                        async for text in stream_manager.text_stream:
                            yield text
                else:
                    # Anthropic 非流式响应
                    response = await self.client.messages.create(
                        model=self.model,
                        max_tokens=16384,
                        system=system_prompt,
                        messages=messages,
                    )
                    yield response.content[0].text
            else:  # openai 兼容客户端 (DeepSeek)
                # OpenAI 格式的消息
                openai_messages = [{"role": "system", "content": system_prompt}] + messages
                if stream:
                    # OpenAI 流式响应
                    stream_obj = await self.client.chat.completions.create(
                        model=self.model,
                        messages=openai_messages,
                        max_tokens=16384,
                        stream=True
                    )
                    async for chunk in stream_obj:
                        if chunk.choices[0].delta.content:
                            yield chunk.choices[0].delta.content
                else:
                    # OpenAI 非流式响应
                    response = await self.client.chat.completions.create(
                        model=self.model,
                        messages=openai_messages,
                        max_tokens=16384,
                        stream=False
                    )
                    yield response.choices[0].message.content

        except Exception as e:
            yield f"\n\n**错误**: API 调用失败 - {str(e)}"

    async def chat_complete(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None,
        mode: str = "coach",
        rae_context: str = "",
    ) -> str:
        """非流式对话（获取完整响应）

        Args:
            message: 用户消息
            conversation_history: 对话历史
            mode: 模式
            rae_context: RAE 知识库参考内容

        Returns:
            完整的响应内容
        """
        messages = self._build_messages(message, conversation_history)
        system_prompt = self._load_system_prompt(mode)

        # 拼接 RAE 知识库参考内容
        if rae_context:
            system_prompt = system_prompt + "\n\n## RAE 语法参考\n\n以下是从 RAE 官方语法知识库中检索到的相关内容，请在回答时参考：\n\n" + rae_context

        try:
            if self.client_type == "anthropic":
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=16384,
                    system=system_prompt,
                    messages=messages,
                )
                return response.content[0].text
            else:  # openai 兼容客户端 (DeepSeek)
                openai_messages = [{"role": "system", "content": system_prompt}] + messages
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=openai_messages,
                    max_tokens=16384,
                    stream=False
                )
                return response.choices[0].message.content

        except Exception as e:
            return f"**错误**: API 调用失败 - {str(e)}"


# 单例模式（可选）
_claude_service = None


def get_claude_service() -> ClaudeService:
    """获取 LLM 服务单例"""
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeService()
    return _claude_service
