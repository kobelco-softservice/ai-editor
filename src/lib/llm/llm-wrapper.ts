// src/lib/llm/llm-wrapper.ts

import {
  callOpenAIStream,
  callAzureOpenAIStream,
  callGeminiStream,
  callDeepSeek,
  callOpenRouterAIStream
} from './llm';
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

export interface Prompt {
  userPrompt: string;
  systemPrompt?: string;
}

export type LLMProvider = 'openai' | 'azure' | 'gemini' | 'deepseek' | 'openrouter';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
}

interface RateLimit {
  maxRequests: number;
  interval: number;
  currentRequests: number;
  lastReset: number;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * LLM API との通信を行うラッパークラス
 * シングルトンパターンは排除し、各クラスに依存性注入する設計に変更。
 */
export class LLMWrapper {
  private static instance: LLMWrapper;
  private rateLimit: RateLimit;
  private requestQueue: Promise<any>;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;

  constructor(private config: LLMConfig) {
    
    this.rateLimit = {
      maxRequests: 60,  // 1分間に60リクエスト（デフォルト）
      interval: 60000,
      currentRequests: 0,
      lastReset: Date.now()
    };
    this.requestQueue = Promise.resolve();
  }

  static getInstance(options: any): LLMWrapper {
    if (!LLMWrapper.instance) {
      LLMWrapper.instance = new LLMWrapper(options);
    }
    return LLMWrapper.instance;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.rateLimit.lastReset >= this.rateLimit.interval) {
      this.rateLimit.currentRequests = 0;
      this.rateLimit.lastReset = now;
    }
    if (this.rateLimit.currentRequests >= this.rateLimit.maxRequests) {
      const waitTime = this.rateLimit.interval - (now - this.rateLimit.lastReset);
      throw new RateLimitError(`Rate limit exceeded. Please wait ${waitTime}ms`);
    }
    this.rateLimit.currentRequests++;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.checkRateLimit();
      return await operation();
    } catch (error) {
      if (error instanceof RateLimitError && this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const waitTime = Math.pow(2, this.retryCount) * 1000; // exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.executeWithRetry(operation);
      }
      throw error;
    } finally {
      this.retryCount = 0;
    }
  }

  /**
   * テキスト生成のストリーム処理を実行します。
   */
  public async processText(prompt: Prompt): Promise<string> {
    return this.requestQueue = this.requestQueue
      .then(() => this.executeWithRetry(async () => {
        const stream = await this.generateStream(prompt);
        const reader = stream.body!.getReader();
        let result = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = new TextDecoder().decode(value);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                result += data.text || '';
              } catch (e) {
                // 無効な JSON はスキップ
              }
            }
          }
        }
        return result;
      }));
  }

  /**
   * 指定されたプロンプトにもとづくストリームレスポンスを生成します。
   */
  public async generateStream(prompt: Prompt): Promise<Response> {
    const message = [
      { role: 'system', content: prompt.systemPrompt },
      { role: 'user', content: prompt.userPrompt }
    ];

    // プロキシ設定
    if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
      setGlobalDispatcher(new EnvHttpProxyAgent());
    }

    const params = {
      model: this.config.model,
      message,
      apiKey: this.config.apiKey,
      endpoint: this.config.endpoint,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens
    };

    console.log("param", params);

    switch (this.config.provider) {
      case 'openrouter':
        return await callOpenRouterAIStream(params);
      case 'openai':
        return await callOpenAIStream(params);
      case 'azure':
        return await callAzureOpenAIStream(params);
      case 'gemini':
        return await callGeminiStream(params);
      case 'deepseek':
        return await callDeepSeek(params);
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }
}