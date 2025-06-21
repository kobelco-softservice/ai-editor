// src/types/analysis/readability.ts

/**
 * 文の長さに関する分析結果
 */
export interface SentenceLengthAnalysis {
    average: number;             // 平均文長
    tooLong: number[];          // 長すぎる文の位置（インデックス）
    distribution: {             // 文長の分布
      short: number;            // 短い文の数
      medium: number;           // 適度な長さの文の数
      long: number;            // 長い文の数
    };
  }
  
  /**
   * 段落構造の分析結果
   */
  export interface ParagraphStructureAnalysis {
    score: number;              // 構造スコア（0-100）
    issues: string[];           // 問題のある段落の説明
    suggestions: string[];      // 改善提案
    statistics: {
      averageLength: number;    // 平均段落長
      coherenceScore: number;   // 段落間の結束性スコア
    };
  }
  
  /**
   * 単語選択の分析結果
   */
  export interface WordChoiceAnalysis {
    difficulty: number;         // 難易度スコア（0-100）
    complexWords: string[];     // 複雑な単語リスト
    suggestions: {              // 改善提案
      word: string;            // 元の単語
      alternatives: string[];   // 代替案
    }[];
    statistics: {
      uniqueWords: number;      // ユニークな単語数
      averageWordLength: number;// 平均単語長
    };
  }
  
  /**
   * 読みやすさの総合分析結果
   */
  export interface ReadabilityAnalysis {
    score: number;                         // 総合的な読みやすさスコア（0-100）
    complexity: {
      sentenceLength: SentenceLengthAnalysis;    // 文の長さ分析
      paragraphStructure: ParagraphStructureAnalysis; // 段落構造
      wordChoice: WordChoiceAnalysis;            // 単語選択
    };
    suggestions: {                         // 改善提案
      priority: string[];                 // 優先度の高い改善点
      general: string[];                  // 一般的な改善提案
    };
    metadata: {                           // 分析メタデータ
      analyzedAt: Date;                   // 分析実施日時
      languageCode: string;               // 分析対象言語
      textLength: number;                 // テキスト長
    };
  }