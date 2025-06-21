// src/types/analysis/style.ts

/**
 * 文体の種類
 */
export type StyleType = 
  | 'formal'      // です/ます調
  | 'informal'    // だ/である調
  | 'polite'      // 丁寧
  | 'casual'      // カジュアル
  | 'business'    // ビジネス
  | 'academic';   // アカデミック

/**
 * 敬語レベル
 */
export type HonorificLevel = 
  | 'none'        // 敬語なし
  | 'basic'       // 基本敬語
  | 'business'    // ビジネス敬語
  | 'formal'      // 格式高い敬語
  | 'mixed';      // 混在

/**
 * 文体の一貫性分析
 */
export interface StyleConsistencyAnalysis {
  score: number;                  // 一貫性スコア（0-100）
  mixedStyles: {                  // 混在している文体
    formal: number;              // です/ます調の割合
    informal: number;            // だ/である調の割合
    other: number;              // その他の文体の割合
  };
  patterns: {                     // 文体パターン
    style: StyleType;           // 文体の種類
    count: number;              // 出現回数
    examples: string[];         // 例文
  }[];
  inconsistencies: {              // 不整合箇所
    location: number;           // 位置
    current: StyleType;         // 現在の文体
    suggested: StyleType;       // 推奨される文体
  }[];
}

/**
 * トーン分析結果
 */
export interface ToneAnalysis {
  primary: string;                // 主要なトーン
  variations: string[];           // 変化している部分
  emotional: {                    // 感情分析
    positive: number;           // ポジティブな表現の割合
    negative: number;           // ネガティブな表現の割合
    neutral: number;           // 中立的な表現の割合
  };
  formality: {                    // 形式度
    level: number;              // 形式度レベル（0-100）
    assessment: string;         // 評価コメント
  };
}

/**
 * 敬語分析結果
 */
export interface HonorificAnalysis {
  level: HonorificLevel;         // 全体的な敬語レベル
  consistency: number;           // 一貫性スコア（0-100）
  inconsistencies: {             // 不整合な部分
    location: number;           // 位置
    issue: string;             // 問題の説明
    suggestion: string;        // 改善案
  }[];
  usage: {                       // 敬語の使用状況
    respectful: string[];      // 尊敬語の使用例
    humble: string[];         // 謙譲語の使用例
    polite: string[];        // 丁寧語の使用例
  };
}

/**
 * 文体分析の総合結果
 */
export interface StyleAnalysis {
  consistency: StyleConsistencyAnalysis;  // 一貫性分析
  tone: ToneAnalysis;                    // トーン分析
  honorifics: HonorificAnalysis;         // 敬語分析
  suggestions: {                          // 改善提案
    critical: string[];                  // 重要な改善点
    recommended: string[];              // 推奨される改善点
    examples: {                         // 改善例
      original: string;                // 元の表現
      improved: string;               // 改善後の表現
      explanation: string;           // 説明
    }[];
  };
  metadata: {                            // メタデータ
    dominantStyle: StyleType;           // 主要な文体
    targetStyle?: StyleType;           // 目標とする文体
    analyzedAt: Date;                  // 分析実施日時
  };
}