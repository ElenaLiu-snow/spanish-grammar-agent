#!/bin/bash

# 西语语法助手启动脚本

echo "🇪🇸 西语语法助手启动中..."

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3，请先安装 Python"
    exit 1
fi

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查后端环境变量
if [ ! -f "backend/.env" ]; then
    echo "⚠️  未找到 backend/.env 文件"
    echo "正在从 .env.example 创建..."
    cp backend/.env.example backend/.env
    echo "⚠️  请编辑 backend/.env 文件，配置 API"
    echo "然后重新运行此脚本"
    exit 1
fi

echo "✅ 配置文件已找到"

# 读取项目端口配置。3000/8000 很容易被其他项目占用，所以本项目默认使用 3001/8001。
set -a
source backend/.env
set +a

FRONTEND_PORT=${FRONTEND_PORT:-3001}
BACKEND_PORT=${BACKEND_PORT:-8001}
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:$BACKEND_PORT}

# 安装后端依赖（如果需要）
BACKEND_VENV="backend/.venv"
if [ ! -d "$BACKEND_VENV" ]; then
    echo "📦 安装后端依赖..."
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# 安装前端依赖（如果需要）
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

# 启动后端
echo "🚀 启动后端服务..."
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port "$BACKEND_PORT" &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "🚀 启动前端服务..."
cd frontend
PORT="$FRONTEND_PORT" NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务已启动！"
echo ""
echo "📚 前端地址: http://localhost:$FRONTEND_PORT"
echo "🔌 后端 API: http://localhost:$BACKEND_PORT"
echo "📖 API 文档: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获退出信号
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

# 等待
wait
