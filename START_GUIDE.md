# 🚀 西语语法助手 - 启动指南

## 日常启动步骤

### 方法一：使用启动脚本（推荐）

```bash
# 1. 进入项目目录
cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent

# 2. 运行启动脚本
./start.sh
```

**就这么简单！** 脚本会自动：
- ✅ 检查配置文件
- ✅ 启动后端服务（端口 8001）
- ✅ 启动前端服务（端口 3001）

### 方法二：手动启动（需要两个终端）

**终端 1 - 启动后端：**
```bash
cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent/backend
uvicorn main:app --reload --port 8001
```

**终端 2 - 启动前端：**
```bash
cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent/frontend
npm run dev
```

## 访问应用

打开浏览器访问：**http://localhost:3001**

## 🛑 停止服务

### 如果使用启动脚本：
在运行脚本的终端按 `Ctrl + C`

### 如果手动启动：
- 在后端终端按 `Ctrl + C`
- 在前端终端按 `Ctrl + C`

## ⚡ 快捷命令（添加到终端配置）

### bash/zsh 用户：
编辑 `~/.zshrc` 或 `~/.bash_profile`，添加：

```bash
# 西语语法助手快捷启动
alias spanish='cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent && ./start.sh'
alias spanish-backend='cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent/backend && source .venv/bin/activate && uvicorn main:app --reload --port 8001'
alias spanish-frontend='cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent/frontend && npm run dev'
```

然后运行 `source ~/.zshrc`，以后只需输入：
- `spanish` - 启动全部
- `spanish-backend` - 只启动后端
- `spanish-frontend` - 只启动前端

## 📋 启动检查清单

- [ ] 确保没有其他程序占用 8001 和 3001 端口
- [ ] 后端 `.env` 文件已配置（API 代理）
- [ ] 前端依赖已安装（首次需要 `npm install`）
- [ ] 后端依赖已安装（首次需要 `pip3 install -r requirements.txt`）

## 🔧 故障排查

### 问题：端口已被占用
```bash
# 查看占用端口的进程
lsof -i :8001  # 后端
lsof -i :3001  # 前端

# 杀死进程
kill -9 <进程ID>
```

### 问题：后端启动失败
```bash
# 检查 Python 版本（需要 3.10+）
python3 --version

# 重新安装依赖
cd backend
pip3 install -r requirements.txt
```

### 问题：前端启动失败
```bash
# 重新安装依赖
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 问题：浏览器显示 Load failed
1. 检查后端是否运行：访问 http://localhost:8001/api/health
2. 检查前端是否运行：访问 http://localhost:3001
3. 打开浏览器控制台（F12）查看错误信息

## 📱 创建桌面快捷方式（Mac）

### 使用 Automator 创建应用：

1. 打开 Automator
2. 选择"应用程序"
3. 搜索并添加"运行 Shell 脚本"
4. 输入：
```bash
cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent
./start.sh
```
5. 保存为"西语语法助手"

现在你可以从应用程序文件夹直接启动！

## 🔄 日常使用流程

1. **启动**：`cd /Users/liujingyi/Desktop/vibe-coding/spanish-grammar-agent && ./start.sh`
2. **等待**：约 3-5 秒让服务启动
3. **访问**：http://localhost:3001
4. **使用**：开始学习西语语法！
5. **关闭**：在终端按 `Ctrl + C`

## 📌 重要提醒

- ⚠️ **每次使用都需要启动服务**（不是永久运行的）
- ⚠️ **修改代码后**：后端会自动重载，前端会自动刷新
- ⚠️ **关闭终端** = 停止服务

## 💡 优化建议

如果想让它永久运行（即使关闭终端）：

```bash
# 使用 nohup 让服务在后台运行
nohup uvicorn main:app --port 8001 > backend.log 2>&1 &
nohup npm run dev > frontend.log 2>&1 &
```

停止时：
```bash
pkill -f "uvicorn main:app"
pkill -f "next dev"
```
