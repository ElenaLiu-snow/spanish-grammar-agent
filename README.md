# 西语语法助手 - Spanish Grammar Agent

面向西语学习者的语法问答与复习网站，后端使用 DeepSeek 的 OpenAI 兼容接口，回答风格参考 RAE（Real Academia Española）规范。

## 功能

- **智能问答** - 解答冠词、介词、时态、虚拟式等语法疑问
- **语法梳理** - 把复杂语法点整理成结构化笔记
- **练习生成** - 自动生成针对性练习题和解析
- **学习页面** - 展示冠词与介词资料，适合滚动复习
- **资料上传** - 支持上传文本、Markdown、Word 和图片

## 使用场景

- 西语学习者查漏补缺
- 语法知识系统梳理
- 考前重点复习
- 练习题生成与自测

## 项目结构

```
spanish-grammar-agent/
├── backend/                 # Python FastAPI 后端
│   ├── main.py             # API 入口
│   ├── routes/             # 路由定义
│   ├── services/           # LLM API 服务
│   ├── prompts/            # RAE 标准提示词
│   └── requirements.txt    # Python 依赖
│
├── frontend/               # Next.js 前端
│   ├── app/                # 页面路由
│   ├── components/         # React 组件
│   └── lib/                # 工具库
│
├── start.sh                # 一键启动脚本
└── README.md
```

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
# 1. 配置 API Key
cd backend
cp .env.example .env
# 编辑 .env，添加你的 DEEPSEEK_API_KEY

# 2. 返回根目录并运行
cd ..
./start.sh
```

### 方式二：手动启动

#### 后端设置

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件，添加你的 DEEPSEEK_API_KEY
uvicorn main:app --reload --port 8001
```

#### 前端设置

```bash
cd frontend
npm install
npm run dev
```

访问 [http://localhost:3001](http://localhost:3001)

## 配置说明

在 `backend/.env` 中设置：

```bash
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
FRONTEND_PORT=3001
BACKEND_PORT=8001
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001
```

如果前端部署到了线上域名，把正式域名加入 `FRONTEND_ORIGINS`。本地前端默认设置：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

线上前端部署时，把它改成你的后端正式域名。

API Key 只能放在后端环境变量里，不要写进前端代码或公开仓库。

## API 端点

### 1. 对话接口
```http
POST /api/chat
Content-Type: application/json

{
  "message": "ser 和 estar 有什么区别？",
  "mode": "chat",
  "stream": true
}
```

### 2. 语法点解析
```http
POST /api/topic
Content-Type: application/json

{
  "topic": "虚拟式现在时",
  "level": "B1"
}
```

### 3. 练习生成
```http
POST /api/exercise
Content-Type: application/json

{
  "topic": "过去时态",
  "level": "B1",
  "count": 5
}
```

## 测试

```bash
# 测试后端 API
cd backend
python test_api.py

# 访问 API 文档
http://localhost:8001/docs
```

## 部署成真正的网站

推荐把前端和后端分开部署：

1. 后端部署到 Render、Railway 或 Fly.io，服务目录选择 `backend/`，启动命令：
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. 后端环境变量设置：
   ```bash
   LLM_PROVIDER=deepseek
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-chat
   FRONTEND_ORIGINS=https://your-frontend-domain.example
   ```

3. 前端部署到 Vercel，项目目录选择 `frontend/`，构建命令使用 `npm run build`。环境变量设置：
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-domain.example
   ```

4. 后端部署完成后，先访问 `/api/health` 确认服务正常，再打开前端域名测试问答与上传。

## 使用技巧

1. **问答模式** - 直接提问任何语法问题
   ```
   什么时候使用虚拟式？
   por 和 para 有什么区别？
   ```

2. **梳理模式** - 系统学习某个语法点
   ```
   虚拟式现在时
   代词式动词
   ```

3. **练习模式** - 生成练习题自测
   ```
   为"ser vs estar"生成 5 道练习题
   过去时态混合练习
   ```

## 技术栈

- **后端**: Python 3.10+ + FastAPI + OpenAI 兼容 SDK
- **前端**: Next.js 15 + React 19 + TypeScript
- **Markdown**: react-markdown + rehype-highlight
- **AI**: DeepSeek

## RAE 标准参考

系统提示词基于以下 RAE 官方资料：
- *Nueva gramática de la lengua española* (NGLE)
- *Ortografía de la lengua española* (OLE)
- *Diccionario de la lengua española* (DLE)

所有回答均引用具体规则编号（如 NGLE 23.5n），确保权威性。

## 开发

### 后端开发
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8001
```

### 前端开发
```bash
cd frontend
npm run dev
```

## License

MIT
