# 快速使用指南

## 第一次使用

### 1. 获取 DeepSeek API Key

在 DeepSeek 开放平台创建 API Key。

### 2. 配置环境

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```bash
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

### 3. 启动服务

**方式一：使用启动脚本**
```bash
./start.sh
```

**方式二：手动启动**
```bash
# 终端 1 - 启动后端
cd backend
uvicorn main:app --reload --port 8001

# 终端 2 - 启动前端
cd frontend
npm run dev
```

### 4. 访问应用

打开浏览器访问：http://localhost:3001

## 使用示例

### 💬 问答模式

适合解答具体问题：

**时态疑问：**
- "pretérito perfecto 和 pretérito indefinido 有什么区别？"
- "什么时候使用虚拟式？"
- "条件式怎么构成？"

**用法辨析：**
- "ser 和 estar 的区别是什么？"
- "por 和 para 怎么区分？"
- "lo que 和 que 有什么不同？"

**语法规则：**
- "性数一致有哪些规则？"
- "代词式动词的重音词怎么处理？"
- "直接宾语和间接宾语代词的位置？"

### 📚 梳理模式

适合系统学习语法点：

切换到"梳理"模式，然后输入：

- "虚拟式现在时"
- "过去时态"
- "冠词系统"
- "指示代词"
- "物主形容词"

会得到结构化的表格、规则总结和例句。

### ✏️ 练习模式

适合考前自测：

切换到"练习"模式，然后输入：

- "为 ser vs estar 生成 5 道填空题"
- "虚拟式现在时练习，B1 级别"
- "过去时态混合练习，包含答案解析"

会得到练习题、答案和详细解析。

## 功能提示

1. **使用 Shift + Enter** 可以在输入框中换行
2. **清空对话** 可以重新开始新的话题
3. **流式输出** 让你可以实时看到答案生成过程
4. **Markdown 格式** 支持表格、列表、代码块等丰富格式

## 常见问题

### Q: 后端启动失败？
A: 检查 Python 版本（需要 3.10+）和依赖安装：
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python --version
pip install -r requirements.txt
```

### Q: 前端连接不上后端？
A:
1. 确认后端正在运行（访问 http://localhost:8001）
2. 检查 `frontend/.env.local` 中的 API_URL 配置
3. 确认没有防火墙阻止

### Q: API 调用失败？
A:
1. 检查 API Key 是否正确
2. 确认 API 账户有足够额度
3. 查看后端日志了解具体错误

### Q: 回答不符合 RAE 标准？
A:
1. 检查 `backend/prompts/system.txt` 内容
2. 可以在问题中强调"请引用 RAE 规则编号"
3. 对于有争议的问题，AI 会说明不同观点

## 进阶使用

### 修改系统提示词

编辑 `backend/prompts/system.txt` 可以调整 AI 的：
- 回答风格
- 输出格式
- 引用规范
- 语言偏好

修改后重启后端服务生效。

### 调整 AI 模型

编辑 `backend/.env` 中的模型名：
```bash
DEEPSEEK_MODEL=deepseek-chat
```

### 自定义界面

修改 `frontend/components/` 下的组件可以定制：
- 颜色主题
- 布局样式
- 交互逻辑

## 学习建议

1. **先提问再梳理** - 对某个语法点有疑问后，用梳理模式系统学习
2. **及时练习** - 学完一个语法点，立即生成练习题巩固
3. **记录笔记** - 将重要的 RAE 规则编号记录下来
4. **反复复习** - 可以对同一语法点多次提问，加深理解

## 有用的在线资源

- [RAE 官方网站](https://www.rae.es/)
- [FundéuRAE](https://www.fundeu.es/) - 西语用法推荐
- [SpanishDict](https://www.spanishdict.com/) - 词典和变位
- [CervantesVirtual](https://www.cervantesvirtual.com/) - 西语语法资料
