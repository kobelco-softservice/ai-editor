// src/lib/llm/llm.ts
// import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

interface LLMRequestParams {
  model: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  message: any;
  apiKey: string | undefined;
  endpoint: string | undefined;
  temperature?: number;
  maxTokens?: number;
}

interface StreamProcessorConfig {
  parseResponse: (line: string) => string | null;
  shouldSkip?: (line: string) => boolean;
}

class LLMError extends Error {
  constructor(message: string, public provider: string, public status?: number) {
    super(message);
    this.name = 'LLMError';
  }
}

// 共通のストリーム処理ロジック
const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  config: StreamProcessorConfig,
  controller: ReadableStreamDefaultController
) => {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || (config.shouldSkip && config.shouldSkip(trimmedLine))) {
          continue;
        }

        const content = config.parseResponse(trimmedLine);
        if (content) {
          const message = { text: content };
          controller.enqueue(new TextEncoder().encode(`${JSON.stringify(message)}\n`));
        }
      }
    }
  } catch (error) {
    controller.error(error);
  }
};

// ストリームレスポンスの作成
export const createStreamResponse = (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  config: StreamProcessorConfig
) => {
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          await processStream(reader, config, controller);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      }
    }), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  }
  );
};


export const callOpenRouterAIStream = async (params: LLMRequestParams) => {
  try {
    const response = await fetch(`${params.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.message,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new LLMError('OpenRouterAI request failed', 'openrouter', response.status);
    }

    return createStreamResponse(
      response.body!.getReader(),
      {
        parseResponse: (line) => {
          if (!line.startsWith('data: ')) return null;
          const content = line.slice(6);
          if (content === '[DONE]') return null;

          try {
            const data = JSON.parse(content);
            return data.choices?.[0]?.delta?.content || null;
          } catch (e) {
            console.error('Error parsing OpenRouterAI response:', e);
            return null;
          }
        },
        shouldSkip: (line) => {
          // [DONE]メッセージやfinish_reasonを含む行をスキップ
          return line === 'data: [DONE]' ||
            line.includes('"finish_reason":"stop"') ||
            line.includes('"finish_reason":"length"');
        }
      }
    );
  }
  catch (error) {
    console.error('Error calling OpenRouterAI:', error);
    throw new LLMError('OpenRouterAI request failed', 'openrouter');
  }
};



// OpenAIのストリーミング処理
export const callOpenAIStream = async (params: LLMRequestParams) => {
  try {
    const response = await fetch(`${params.endpoint}/openai/deployments/${params.model}/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': params.apiKey as string,
      } as HeadersInit,
      body: JSON.stringify({
        model: params.model,
        messages: params.message,
        // temperature: params.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new LLMError('OpenAI request failed', 'openai', response.status);
    }

    return createStreamResponse(
      response.body!.getReader(),
      {
        parseResponse: (line) => {
          if (!line.startsWith('data: ')) return null;
          const content = line.slice(6);
          if (content === '[DONE]') return null;

          try {
            const data = JSON.parse(content);
            return data.choices?.[0]?.delta?.content || null;
          } catch (e) {
            console.error('Error parsing OpenAI response:', e);
            return null;
          }
        },
        shouldSkip: (line) => {
          // [DONE]メッセージやfinish_reasonを含む行をスキップ
          return line === 'data: [DONE]' ||
            line.includes('"finish_reason":"stop"') ||
            line.includes('"finish_reason":"length"');
        }
      }
    );
  }
  catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new LLMError('OpenAI request failed', 'openai');
  }
};

// Azure OpenAIのストリーミング処理
export const callAzureOpenAIStream = async (params: LLMRequestParams) => {
  const response = await fetch(`${params.endpoint}/openai/deployments/${params.model}/chat/completions?api-version=2024-02-15-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': params.apiKey,
    } as HeadersInit,
    body: JSON.stringify({
      // messages: [{ role: 'user', content: params.message }],
      messages: params.message,
      // temperature: params.temperature,
      // max_tokens: params.maxTokens,
      stream: true,
    }),
  });

  console.log(response)

  if (!response.ok) {
    throw new LLMError('Azure OpenAI request failed', 'azure', response.status);
  }

  return createStreamResponse(
    response.body!.getReader(),
    {
      parseResponse: (line) => {
        if (!line.startsWith('data: ')) return null;
        const content = line.slice(6);
        if (content === '[DONE]') return null;

        try {
          const data = JSON.parse(content);
          return data.choices?.[0]?.delta?.content || null;
        } catch (e) {
          console.error('Error parsing Azure OpenAI response:', e);
          return null;
        }
      },
      shouldSkip: (line) => {
        return line === 'data: [DONE]' ||
          line.includes('"finish_reason":"stop"') ||
          line.includes('"finish_reason":"length"');
      }
    }
  );
};

// Geminiのストリーミング処理
export const callGeminiStream = async (params: LLMRequestParams) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: params.message }] }],
      generationConfig: {
        temperature: params.temperature ?? 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new LLMError('Gemini request failed', 'gemini', response.status);
  }

  return createStreamResponse(
    response.body!.getReader(),
    {
      parseResponse: (chunk) => {
        try {
          const data = JSON.parse(chunk);
          return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (e) {
          console.error('Error parsing Gemini response:', e);
          return null;
        }
      }
    }
  );
};

// DeepSeekのストリーミング処理
export const callDeepSeek = async (params: LLMRequestParams) => {
  const response = await fetch(`${params.endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.message,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new LLMError('DeepSeek request failed', 'deepseek', response.status);
  }

  return createStreamResponse(
    response.body!.getReader(),
    {
      parseResponse: (line) => {
        if (!line.startsWith('data: ')) return null;
        try {
          const json = JSON.parse(line.slice(6));
          return json.choices?.[0]?.delta?.content || null;
        } catch (e) {
          console.error('Error parsing DeepSeek response:', e);
          return null;
        }
      },
      shouldSkip: (line) => line === 'data: [DONE]' ||
        line.includes('"finish_reason":"stop"')
    }
  );
};