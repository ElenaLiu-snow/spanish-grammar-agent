import { NextRequest } from 'next/server';
import { chatStream } from '@/lib/llm-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let prompt = body.topic;
    if (body.level) {
      prompt = `难度级别：${body.level}\n\n请系统梳理：${body.topic}`;
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatStream(prompt, { mode: 'drill' })) {
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
