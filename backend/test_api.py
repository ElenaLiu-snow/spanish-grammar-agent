#!/usr/bin/env python3
"""
后端 API 测试脚本
测试各个端点是否正常工作
"""

import requests
import json
import os

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8001")

def test_health():
    """测试健康检查端点"""
    print("🔍 测试健康检查端点...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    print("✅ 健康检查通过\n")

def test_chat_non_stream():
    """测试非流式聊天"""
    print("🔍 测试非流式聊天...")
    payload = {
        "message": "Ser 和 estar 有什么区别？",
        "stream": False
    }
    response = requests.post(f"{BASE_URL}/api/chat", json=payload)
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"响应长度: {len(data['response'])} 字符")
        print(f"响应预览: {data['response'][:200]}...")
        print("✅ 聊天测试通过\n")
    else:
        print(f"❌ 错误: {response.text}\n")

def test_topic():
    """测试语法点解析"""
    print("🔍 测试语法点解析...")
    payload = {
        "topic": "虚拟式现在时",
        "level": "B1"
    }
    response = requests.post(f"{BASE_URL}/api/topic", json=payload)
    print(f"状态码: {response.status_code}")
    print("⚠️  此端点返回流式响应，请在前端测试\n")

def test_exercise():
    """测试练习生成"""
    print("🔍 测试练习生成...")
    payload = {
        "topic": "过去时态",
        "level": "B1",
        "count": 3
    }
    response = requests.post(f"{BASE_URL}/api/exercise", json=payload)
    print(f"状态码: {response.status_code}")
    print("⚠️  此端点返回流式响应，请在前端测试\n")

if __name__ == "__main__":
    print("🧪 开始测试后端 API...\n")

    try:
        test_health()
        test_chat_non_stream()
        test_topic()
        test_exercise()

        print("✅ 所有测试完成！")
    except requests.exceptions.ConnectionError:
        print("❌ 错误: 无法连接到后端服务")
        print("请确保后端服务正在运行 (cd backend && uvicorn main:app --reload)")
    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")
