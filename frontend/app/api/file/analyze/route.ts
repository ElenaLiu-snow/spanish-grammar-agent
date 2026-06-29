import { NextRequest, NextResponse } from 'next/server';
import { chatComplete } from '@/lib/llm-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, file_type, content, question } = body;

    if (file_type === 'image') {
      return NextResponse.json({
        status: 'error',
        message: '图片分析功能正在开发中，请稍后再试',
      });
    }

    const contentPreview = (content || '').slice(0, 500);

    let prompt: string;
    if (question) {
      prompt = `我有以下文档内容：

\`\`\`
文件名：${filename}
${question}

文档内容（节选）：
${contentPreview}
\`\`\`

请根据文档内容回答问题。`;
    } else {
      prompt = `请分析以下文档内容，并：
1. 总结文档的主要内容
2. 识别其中任何与西班牙语语法相关的内容
3. 如果有语法错误或不规范的表达，请指出并纠正

文件名：${filename}

文档内容：
${content}`;
    }

    const response = await chatComplete(prompt);
    return NextResponse.json({ status: 'success', response });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: 'error', message: `分析失败: ${errMsg}` }, { status: 500 });
  }
}
