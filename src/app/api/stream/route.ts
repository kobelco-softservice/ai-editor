// src/app/api/analyze/stream/route.ts

import { NextRequest } from 'next/server';
import { LLMWrapper } from '@/lib/llm/llm-wrapper';
// import { createStylePrompt,  } from '@/lib/prompts/templates/analysis';

// export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // history を追加。各メッセージは { role: 'user' | 'assistant', content: string } を想定
    const { text, history, type = 'full', systemPrompt,userPrompt, options = {} } = body;

    
    // 「menu」タイプの場合は text チェックを行わず、代わりに userPrompt の存在を確認
    if (type !== 'menu' && (!text || typeof text !== 'string')) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400 }
      );
    }
    if (type === 'menu' && (!userPrompt || typeof userPrompt !== 'string')) {
      return new Response(
        JSON.stringify({ error: 'User prompt is required for menu type' }),
        { status: 400 }
      );
    }
    // LLMラッパーのインスタンス取得
    const llm = LLMWrapper.getInstance({
      provider: process.env.LLM_PROVIDER ,
      model: process.env.LLM_MODEL ,
      endpoint: process.env.LLM_API_ENDPOINT,
      apiKey: process.env.LLM_API_KEY,
      temperature: process.env.LLM_TEMPERATURE,
      maxTokens: process.env.LLM_MAX_TOKENS,
    });

    let prompt: { userPrompt: string; systemPrompt?: string };

    if (type === 'full') {
      // もし過去の会話履歴があれば、その内容を連結してプロンプトに含める
      let conversation = '';
      if (history && Array.isArray(history)) {
        conversation = history
          .map((msg: { role: 'user' | 'assistant'; content: string }) =>
            msg.role === 'assistant'
              ? `アシスタント: ${msg.content}`
              : `ユーザー: ${msg.content}`
          )
          .join("\n");
        // 新たなメッセージを追加
        conversation += `\nユーザー: ${text}`;
      } else {
        conversation = text;
      }
      prompt = { userPrompt: conversation };
    } else {
      // 他のタイプの場合は従来の方法を適用
      switch (type) {
        // case 'readability':
        //   prompt = createReadabilityPrompt(text, options);
        //   break;
        // case 'style':
        //   prompt = createStylePrompt(text, options);
        //   break;
        // case 'context':
        //   prompt = createContextPrompt(text, options);
        //   break;
        case 'menu':
          prompt = { systemPrompt: systemPrompt, userPrompt: userPrompt };
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid analysis type' }),
            { status: 400 }
          );
      }
    }
    
    // systemPromptを設定（引数がなければデフォルト値を使用）
    prompt.systemPrompt = systemPrompt || "あなたは熟練したライターです。プロンプトの指示に誠実に従ってください。";

    // LLMWrapper の generateStream にユーザープロンプトとシステムプロンプトを渡す
    const stream = await llm.generateStream(prompt);

    return new Response(stream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Stream analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500 }
    );
  }
}