# 快速启动指南

## 你已经配置好 API！

✅ 项目已经切换到 DeepSeek 的 OpenAI 兼容接口，API Key 存放在后端环境变量中。

## 配置说明

项目已配置使用：
- **提供商**: DeepSeek
- **接口地址**: https://api.deepseek.com
- **模型**: deepseek-chat

配置文件：`backend/.env`

## 启动服务

### 方式一：使用启动脚本（推荐）

```bash
cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent
./start.sh
```

### 方式二：手动启动

**1. 安装后端依赖**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
```

**2. 启动后端**
```bash
cd backend
uvicorn main:app --reload --port 8001
```

**3. 启动前端**（新开一个终端）
```bash
cd frontend
npm run dev
```

## 访问应用

打开浏览器访问：http://localhost:3001

## 测试 API

```bash
cd backend
python3 test_api.py
```

## 如果需要更换配置

编辑 `backend/.env` 文件：

```bash
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

## 常见问题

**Q: 启动后端失败？**
```bash
# 检查 Python 版本
python3 --version

# 安装依赖
cd backend
pip3 install -r requirements.txt
```

**Q: 前端连接不上后端？**
- 确保后端正在运行
- 访问 http://localhost:8001 检查后端状态
- 检查防火墙设置

**Q: API 调用失败？**
- 检查 `backend/.env` 中的 DeepSeek API Key 是否正确
- 确认 DeepSeek 账户额度充足
- 查看后端终端的错误信息

祝你学习愉快！🇪🇸
