// src/lib/api-client.ts

import type { AnalysisType, AnalysisOptions, TextAnalysis } from '@/types/analysis';

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function analyzeText(
  text: string,
  type: AnalysisType = 'full',
  options: AnalysisOptions = {
    type: 'style',
    language: ''
  }
): Promise<TextAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        type,
        options,
      }),
    });

    if (!response.ok) {
      throw new APIError('Analysis failed', response.status);
    }

    const data = await response.json();
    return data as TextAnalysis;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

// ストリーミング版の分析API
export async function analyzeTextStream(
  text: string,
  type: AnalysisType = 'full',
  options: AnalysisOptions = {
    type: 'readability',
    language: ''
  }
): Promise<ReadableStream> {
  try {
    const response = await fetch('/api/analyze/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        type,
        options,
      }),
    });

    if (!response.ok) {
      throw new APIError('Analysis failed', response.status);
    }

    return response.body!;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

// 部分的な分析のためのAPI
export async function analyzeReadability(text: string, options: AnalysisOptions = {
  type: 'readability',
  language: ''
}) {
  return analyzeText(text, 'readability', options);
}

export async function analyzeStyle(text: string, options: AnalysisOptions = {
  type: 'readability',
  language: ''
}) {
  return analyzeText(text, 'style', options);
}

export async function analyzeContext(text: string, options: AnalysisOptions = {
  type: 'readability',
  language: ''
}) {
  return analyzeText(text, 'context', options);
}