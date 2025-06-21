//src/lib/llm/client.ts 

import { RateLimiter } from './rate-limiter';
import type { LLMConfig, LLMProvider } from './llm-wrapper';

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM API との通信やリクエストレートの制御を行うクライアントクラス
 */
export class LLMClient {
  private static instance: LLMClient;
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: RateLimiter;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_LLM_API_URL || '';
    this.rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
  }

  static getInstance(): LLMClient {
    if (!LLMClient.instance) {
      LLMClient.instance = new LLMClient();
    }
    return LLMClient.instance;
  }

  /**
   * LLMWrapper の設定情報を返します。
   * 利用例: provider, model などの値を環境変数から取得（必要に応じて変更してください）
   */
  public getConfiguration(): LLMConfig {
    return {
      provider: process.env.LLM_PROVIDER as LLMProvider ?? 'openai',
      model: process.env.LLM_MODEL ?? 'gpt-3.5-turbo',
      apiKey: this.apiKey,
      endpoint: this.baseUrl,
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  /**
   * 指定したプロンプトで LLM API からテキスト生成を行います。
   */
  async generateCompletion(
    prompt: string,
    options: LLMOptions = {}
  ): Promise<LLMResponse> {
    await this.rateLimiter.checkLimit();

    try {
      const response = await fetch(`${this.baseUrl}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
          model: options.model ?? 'gpt-3.5-turbo'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].text,
        usage: data.usage
      };
    } catch (error) {
      console.error('LLM API Error:', error);
      throw error;
    }
  }

  async summarize(text: string, length: 'short' | 'medium' | 'long'): Promise<string> {
    const lengthPrompts = {
      short: '3行程度で',
      medium: '1段落程度で',
      long: '詳細に'
    };

    const prompt = `以下の文章を${lengthPrompts[length]}要約してください:\n\n${text}`;
    const response = await this.generateCompletion(prompt);
    return response.text;
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const prompt = `以下の文章を${targetLang}に翻訳してください:\n\n${text}`;
    const response = await this.generateCompletion(prompt);
    return response.text;
  }

  async changeStyle(text: string, style: string): Promise<string> {
    const prompt = `以下の文章を${style}な文体に書き換えてください:\n\n${text}`;
    const response = await this.generateCompletion(prompt);
    return response.text;
  }

  async continueText(text: string): Promise<string> {
    const prompt = `以下の文章の続きを生成してください:\n\n${text}`;
    const response = await this.generateCompletion(prompt);
    return response.text;
  }
}