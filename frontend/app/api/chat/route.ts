import { NextRequest } from 'next/server';
import { chatStream, autoDetectMode, ChatMode } from '@/lib/llm-service';
import { retrieve } from '@/lib/knowledge-base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message;
    const conversationHistory: ChatMessage[] | undefined = body.conversation_history;
    const mode: string = body.mode || 'auto';
    const stream: boolean = body.stream !== false;

    // Auto-detect mode
    const resolvedMode: ChatMode =
      !mode || mode === 'auto' ? autoDetectMode(message) : (mode as ChatMode);

    // RAE knowledge retrieval
    let raeContext = '';
    try {
      raeContext = retrieve(message);
    } catch {
      // knowledge base unavailable — continue without it
    }

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chatStream(message, {
              conversationHistory,
              mode: resolvedMode,
              raeContext,
            })) {
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
    } else {
      // Non-streaming: collect all chunks and return as JSON
      let fullResponse = '';
      for await (const chunk of chatStream(message, {
        conversationHistory,
        mode: resolvedMode,
        raeContext,
      })) {
        fullResponse += chunk;
      }
      return Response.json({ response: fullResponse });
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
