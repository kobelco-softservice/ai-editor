// src/types/analysis/index.ts

export * from './readability';
export * from './style';
export * from './text-analysis';

// 共通の型定義
export type AnalysisType = 
  | 'readability'  // 読みやすさ分析
  | 'style'        // 文体分析
  | 'keywords'     // キーワード分析
  | 'context'      // コンテキスト分析
  | 'full';        // 全分析

export type AnalysisPriority = 
  | 'high'    // 重要
  | 'medium'  // 中程度
  | 'low';    // 低

export interface AnalysisOptions {
  type: AnalysisType;
  language: string;
  priority?: AnalysisPriority;
  includeExamples?: boolean;
  maxSuggestions?: number;
}

export interface AnalysisError {
  code: string;
  message: string;
  location?: number;
  severity: 'error' | 'warning' | 'info';
}

export interface AnalysisResult<T> {
  data: T;
  errors?: AnalysisError[];
  timestamp: Date;
  processingTime: number;
}