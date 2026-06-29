// API 客户端 - 用于与后端通信

// 部署到 Vercel 后，API routes 与前端同域，无需配置额外 URL。
// 本地开发时如需连接独立后端，设置 NEXT_PUBLIC_API_URL=http://localhost:8001
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  mode?: 'coach' | 'drill' | 'correction' | 'oral' | 'culture' | 'auto';
  stream?: boolean;
}

export interface TopicRequest {
  topic: string;
  level?: string;
}

export interface ExerciseRequest {
  topic: string;
  level?: string;
  count?: number;
  exercise_type?: string;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 发送聊天消息（流式响应）
   */
  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          conversation_history: request.conversation_history || [],
          mode: request.mode || 'auto',
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * 分析语法点（流式响应）
   */
  async analyzeTopic(
    request: TopicRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * 生成练习题（流式响应）
   */
  async generateExercise(
    request: ExerciseRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/exercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return response.json();
  }
}

// 导出单例
export const apiClient = new APIClient();
