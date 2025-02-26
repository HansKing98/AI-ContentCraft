/**
 * ARK API 工具函数
 * 用于与 ARK 的 API 进行通信，类似于 OpenAI 接口
 */

interface ChatCompletionOptions {
  messages: Array<{role: string, content: string}>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  created: number;
  id: string;
  model: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

export const arkClient = {
  async chatCompletions(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      throw new Error('未配置 ARK_API_KEY 环境变量');
    }

    const baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    const defaultModel = 'deepseek-r1-distill-qwen-7b-250120';

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || defaultModel,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        response_format: options.response_format
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ARK API 错误: ${error}`);
    }

    return await response.json();
  }
};

// 兼容性接口，与 OpenAI 类似的结构
export const openaiCompatClient = {
  chat: {
    completions: {
      create: arkClient.chatCompletions
    }
  }
}; 