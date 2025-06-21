// src/lib/services/analysis/utils.ts

interface Token {
    text: string;
    type: 'word' | 'punctuation' | 'whitespace';
    position: number;
  }
  
  /**
   * テキストを文単位に分割する
   */
  export function splitSentences(text: string): string[] {
    // 日本語と英語の文末表現に対応
    const sentenceEndings = /([。．！？!?]|\.\s+|\n\n)/g;
    
    // 文を分割
    const sentences = text
      .split(sentenceEndings)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());
  
    return sentences;
  }
  
  /**
   * テキストを段落単位に分割する
   */
  export function splitParagraphs(text: string): string[] {
    // 空行で段落を分割
    return text
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
  }
  
  /**
   * テキストをトークン（単語など）に分割する
   */
  export async function tokenize(text: string): Promise<string[]> {
    // 基本的な単語分割
    // 注: 実際のプロジェクトでは形態素解析ライブラリを使用することを推奨
    const tokens = text
      .split(/(\s+|[、。，．！？!?,.])/g)
      .filter(t => t.trim().length > 0);
  
    return tokens;
  }
  
  /**
   * テキストの文字種を判定する
   */
  export function getCharacterType(char: string): 'hiragana' | 'katakana' | 'kanji' | 'alphabet' | 'number' | 'symbol' {
    const code = char.charCodeAt(0);
  
    if (code >= 0x3040 && code <= 0x309F) return 'hiragana';
    if (code >= 0x30A0 && code <= 0x30FF) return 'katakana';
    if ((code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF)) return 'kanji';
    if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) return 'alphabet';
    if (code >= 0x0030 && code <= 0x0039) return 'number';
    return 'symbol';
  }
  
  /**
   * 文字列の複雑さをスコア化する
   */
  export function calculateComplexity(text: string): number {
    let complexity = 0;
    let characterTypes = new Set<string>();
  
    // 文字種の多様性を評価
    for (let char of text) {
      characterTypes.add(getCharacterType(char));
    }
  
    // 基本スコアの計算
    complexity += characterTypes.size * 10;
  
    // 文の長さによる補正
    const length = text.length;
    if (length > 100) complexity += 20;
    else if (length > 50) complexity += 10;
  
    // 最終スコアの正規化（0-100の範囲に収める）
    return Math.min(100, Math.max(0, complexity));
  }
  
  /**
   * 文の形式度を判定する
   */
  export function analyzeFormalityLevel(text: string): number {
    let formalityScore = 50; // 基本スコア
  
    // 丁寧語の検出
    if (text.includes('です') || text.includes('ます')) {
      formalityScore += 20;
    }
  
    // 敬語の検出
    if (text.includes('れる') || text.includes('られる')) {
      formalityScore += 10;
    }
  
    // 謙譲語の検出
    if (text.includes('いたす') || text.includes('申し上げ')) {
      formalityScore += 15;
    }
  
    // カジュアルな表現の検出（減点）
    if (text.includes('だよ') || text.includes('だね')) {
      formalityScore -= 15;
    }
  
    // スコアの正規化
    return Math.min(100, Math.max(0, formalityScore));
  }
  
  /**
   * 文章の感情的な傾向を分析する
   */
  export function analyzeEmotionalTone(text: string): {
    positive: number;
    negative: number;
    neutral: number;
  } {
    // 簡易的な感情分析
    // 注: 実際のプロジェクトではより高度な感情分析ライブラリの使用を推奨
    const positiveWords = ['良い', '素晴らしい', '嬉しい', '感謝', '期待'];
    const negativeWords = ['悪い', '残念', '困難', '不安', '心配'];
  
    let positive = 0;
    let negative = 0;
  
    // 各感情語の出現回数をカウント
    positiveWords.forEach(word => {
      const count = (text.match(new RegExp(word, 'g')) || []).length;
      positive += count;
    });
  
    negativeWords.forEach(word => {
      const count = (text.match(new RegExp(word, 'g')) || []).length;
      negative += count;
    });
  
    const total = positive + negative;
    const positiveScore = total > 0 ? (positive / total) * 100 : 33.33;
    const negativeScore = total > 0 ? (negative / total) * 100 : 33.33;
    const neutralScore = 100 - positiveScore - negativeScore;
  
    return {
      positive: positiveScore,
      negative: negativeScore,
      neutral: neutralScore
    };
  }
  
  /**
   * キャッシュキーを生成する
   */
  export function generateCacheKey(text: string, options?: any): string {
    const hash = Array.from(text)
      .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
      .toString(36);
    
    return `${hash}_${options ? JSON.stringify(options) : ''}`;
  }