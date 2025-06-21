// src/types/analysis/text-analysis.ts

import { ReadabilityAnalysis } from './readability';
import { StyleAnalysis } from './style';

/**
 * テキストの基本メタデータ
 */
export interface TextMetadata {
  charCount: number;           // 文字数
  wordCount: number;           // 単語数
  sentenceCount: number;       // 文の数
  paragraphCount: number;      // 段落数
  languageCode: string;        // 言語コード
  createdAt: Date;            // 作成日時
  lastModified: Date;         // 最終更新日時
}

/**
 * キーワード分析結果
 */
export interface KeywordAnalysis {
  mainTopics: string[];       // メインとなるトピック
  keywords: {
    word: string;            // キーワード
    frequency: number;       // 出現頻度
    importance: number;      // 重要度（0-1）
    context: string[];       // 使用文脈
  }[];
  suggestions: {              // キーワードに関する提案
    missing: string[];       // 追加を推奨するキーワード
    overused: string[];     // 使用頻度が高すぎるキーワード
    alternatives: {         // 代替案
      original: string;    // 元のキーワード
      suggested: string[]; // 提案するキーワード
    }[];
  };
}

/**
 * 改善提案
 */
export interface ImprovementSuggestions {
  critical: {                 // 重要な改善点
    type: string;            // 改善の種類
    description: string;     // 説明
    location: number[];      // 該当箇所
    priority: number;        // 優先度（1-5）
  }[];
  suggestions: {             // 一般的な改善提案
    type: string;           // 提案の種類
    description: string;    // 説明
    reason: string;        // 理由
  }[];
  examples: {                // 改善例
    original: string;       // 元のテキスト
    improved: string;      // 改善後のテキスト
    explanation: string;   // 説明
  }[];
}

/**
 * コンテキスト分析
 */
export interface ContextAnalysis {
  audience: {                // 想定読者
    level: string;          // レベル（初級/中級/上級）
    background: string[];   // 想定される背景知識
  };
  purpose: {                // 文章の目的
    primary: string;       // 主な目的
    secondary: string[];   // 副次的な目的
  };
  genre: {                  // 文章のジャンル
    type: string;         // 種類
    characteristics: string[]; // 特徴
  };
  tone: {                   // 全体的なトーン
    type: string;         // 種類
    appropriateness: number; // 適切さ（0-100）
  };
}

/**
 * テキスト分析の総合結果
 */
export interface TextAnalysis {
  metadata: TextMetadata & { analyzedAt: Date };              // メタデータ
  readability: ReadabilityAnalysis;    // 読みやすさ分析
  style: StyleAnalysis;                // 文体分析
  keywords: KeywordAnalysis;           // キーワード分析
  improvements: ImprovementSuggestions; // 改善提案
  context: ContextAnalysis;            // コンテキスト分析
  summary: {                           // 分析サマリー
    strengths: string[];              // 強み
    weaknesses: string[];            // 弱み
    overallScore: number;           // 総合スコア（0-100）
  };
}
