import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export type ChatMode = 'coach' | 'drill' | 'correction' | 'oral' | 'culture';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Prompt cache loaded at startup
const promptDir = path.join(process.cwd(), 'lib/prompts');
const promptCache: Record<string, string> = {};

function loadPrompt(mode: string): string {
  if (promptCache[mode]) return promptCache[mode];

  // Load _base.txt
  let base = '';
  try {
    base = fs.readFileSync(path.join(promptDir, '_base.txt'), 'utf-8');
  } catch {}

  // Load mode-specific prompt
  let modeSpecific = '';
  try {
    modeSpecific = fs.readFileSync(path.join(promptDir, `${mode}.txt`), 'utf-8');
  } catch {
    // Fallback to legacy system.txt
    try {
      modeSpecific = fs.readFileSync(path.join(promptDir, 'system.txt'), 'utf-8');
    } catch {
      modeSpecific = '你是西语语法专家助手，严格遵循 RAE 标准回答语法问题。输出使用 Markdown 格式。';
    }
  }

  const combined = base ? `${base}\n\n${modeSpecific}` : modeSpecific;
  promptCache[mode] = combined;
  return combined;
}

// Lazy-initialized OpenAI client
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;

  const provider = process.env.LLM_PROVIDER || 'deepseek';
  if (provider === 'deepseek') {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('请设置 DEEPSEEK_API_KEY 环境变量');

    client = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    });
  } else {
    throw new Error(`不支持的 LLM provider: ${provider}`);
  }

  return client;
}

export function getModel(): string {
  return process.env.DEEPSEEK_MODEL || 'deepseek-chat';
}

export function autoDetectMode(message: string): ChatMode {
  const msg = message.toLowerCase();

  const coachKeywords = ['计划', '规划', '安排', '分钟', '今天练', '每日', '怎么复习',
    '怎么学', '学习路径', '备考', '时间', '薄弱'];
  if (coachKeywords.some(w => msg.includes(w))) return 'coach';

  const drillKeywords = ['出题', '出几道', '出一组', '填空题', '选择题', '练习',
    '生成题目', '给我几道', '来几道', '做几道', '帮我出',
    '练介词', '练时态', '练动词', '练冠词'];
  if (drillKeywords.some(w => msg.includes(w))) return 'drill';

  const correctionKeywords = ['批改', '改错', '纠正', '帮我看看', '对不对', '错在哪',
    '帮我检查', '有没有错', '哪里不对', '订正', '修改'];
  if (correctionKeywords.some(w => msg.includes(w))) return 'correction';

  const oralKeywords = ['口语', '怎么说', '对话', '俚语', '日常用', '地道',
    '怎么表达', '口头', '聊天时', '朋友之间', "pa'", '缩写'];
  if (oralKeywords.some(w => msg.includes(w))) return 'oral';

  const cultureKeywords = ['文化', '节日', '习俗', '历史背景', '地区差异', '传统',
    '圣诞', '新年', '亡灵节', '斗牛', '弗拉明戈', 'tapas',
    '为什么这样说', '这个词的来历', '语源'];
  if (cultureKeywords.some(w => msg.includes(w))) return 'culture';

  return 'coach';
}

function buildMessages(
  userMessage: string,
  conversationHistory?: ChatMessage[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (conversationHistory) {
    messages.push(...conversationHistory as OpenAI.Chat.ChatCompletionMessageParam[]);
  }
  messages.push({ role: 'user', content: userMessage });
  return messages;
}

/**
 * Streaming chat — yields content chunks via an async generator.
 */
export async function* chatStream(
  message: string,
  options: {
    conversationHistory?: ChatMessage[];
    mode?: ChatMode;
    raeContext?: string;
  } = {},
): AsyncGenerator<string, void, undefined> {
  const openai = getClient();
  const model = getModel();
  const mode = options.mode || 'coach';
  let systemPrompt = loadPrompt(mode);

  if (options.raeContext) {
    systemPrompt += `\n\n## RAE 语法参考\n\n以下是从 RAE 官方语法知识库中检索到的相关内容，请在回答时参考：\n\n${options.raeContext}`;
  }

  const messages = buildMessages(message, options.conversationHistory);
  const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: allMessages,
      max_tokens: 16384,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    yield `\n\n**错误**: API 调用失败 - ${errMsg}`;
  }
}

/**
 * Non-streaming chat — returns the complete response.
 */
export async function chatComplete(
  message: string,
  options: {
    conversationHistory?: ChatMessage[];
    mode?: ChatMode;
    raeContext?: string;
  } = {},
): Promise<string> {
  const openai = getClient();
  const model = getModel();
  const mode = options.mode || 'coach';
  let systemPrompt = loadPrompt(mode);

  if (options.raeContext) {
    systemPrompt += `\n\n## RAE 语法参考\n\n以下是从 RAE 官方语法知识库中检索到的相关内容，请在回答时参考：\n\n${options.raeContext}`;
  }

  const messages = buildMessages(message, options.conversationHistory);
  const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: allMessages,
      max_tokens: 16384,
      stream: false,
    });
    return response.choices[0]?.message?.content || '';
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return `**错误**: API 调用失败 - ${errMsg}`;
  }
}
