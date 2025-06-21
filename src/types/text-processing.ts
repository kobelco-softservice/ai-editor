// src/types/text-processing.ts
export type SupportedLanguage = 'ja' | 'en' | 'zh' | 'ko';
export type TextStyle = 'formal' | 'casual' | 'business' | 'academic';
export type SummaryLength = 'short' | 'medium' | 'long';

export interface TextAnalysisResult {
  readability: {
    score: number;
    suggestions: string[];
  };
  tone: {
    style: TextStyle;
    consistency: number;
    suggestions: string[];
  };
  structure: {
    score: number;
    suggestions: string[];
  };
  keywords: string[];
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  preserveStyle?: boolean;
}

export interface StyleChangeRequest {
  text: string;
  language: SupportedLanguage;
  targetStyle: TextStyle;
  preserveContent?: boolean;
}

export interface SummarizationRequest {
  text: string;
  language: SupportedLanguage;
  length: SummaryLength;
  focusPoints?: string[];
}

export interface TextContinuationRequest {
  text: string;
  language: SupportedLanguage;
  style?: TextStyle;
  length?: number;
  topics?: string[];
}