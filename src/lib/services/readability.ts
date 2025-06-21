// src/lib/services/analysis/readability.ts

import { LLMWrapper } from '@/lib/llm/llm-wrapper';
import type {
  ReadabilityAnalysis,
  SentenceLengthAnalysis,
  ParagraphStructureAnalysis,
  WordChoiceAnalysis
} from '@/types/analysis';
import { splitSentences, splitParagraphs, tokenize } from './utils';

/**
 * 文の可読性を解析するためのクラス
 *
 * このクラスは、入力テキストを「文」「段落」「単語」に分割し、各側面から解析を行います。
 * 解析結果に基づいて可読性の総合スコアや改善提案を生成します。
 */
export class ReadabilityAnalyzer {
  /**
   * コンストラクタ
   * @param llm LLMWrapperのインスタンス。現在の実装では直接利用していませんが、将来的な拡張を想定しています。
   */
  constructor(private llm: LLMWrapper) {}

  /**
   * テキスト全体の可読性を解析します。
   *
   * テキストを文、段落、単語に分割し、それぞれについて解析を行った後、各要素の
   * 結果を統合して総合スコアおよび改善提案（優先度・一般）のリストを生成します。
   *
   * @param text 解析対象のテキスト
   * @returns ReadabilityAnalysis 解析結果（総合スコア、詳細解析、改善提案、メタデータ）
   */
  public async analyze(text: string): Promise<ReadabilityAnalysis> {
    // 各解析処理を順次実行
    const sentenceAnalysis = await this.analyzeSentenceLength(text);
    const paragraphAnalysis = await this.analyzeParagraphStructure(text);
    const wordAnalysis = await this.analyzeWordChoice(text);

    // 各結果を加味して総合スコアを算出
    const score = this.calculateOverallScore(
      sentenceAnalysis,
      paragraphAnalysis,
      wordAnalysis
    );

    // 改善提案（優先度・一般）の生成
    const suggestionsPriority = this.generatePrioritySuggestions(
      sentenceAnalysis,
      paragraphAnalysis,
      wordAnalysis
    );
    const suggestionsGeneral = this.generateGeneralSuggestions(
      text,
      sentenceAnalysis,
      paragraphAnalysis,
      wordAnalysis
    );

    return {
      score,
      complexity: {
        sentenceLength: sentenceAnalysis,
        paragraphStructure: paragraphAnalysis,
        wordChoice: wordAnalysis,
      },
      suggestions: {
        priority: suggestionsPriority,
        general: suggestionsGeneral,
      },
      metadata: {
        analyzedAt: new Date(),
        languageCode: 'ja',
        textLength: text.length,
      },
    };
  }

  /**
   * テキストを文に分割し、各文の文字数、平均文字数、長すぎる文（100文字超）のインデックス、
   * 及び短文・中文・長文の分布を解析します。
   *
   * @param text 解析対象のテキスト
   * @returns SentenceLengthAnalysis 各文の長さに関する統計と問題点
   */
  private async analyzeSentenceLength(text: string): Promise<SentenceLengthAnalysis> {
    const sentences = splitSentences(text);
    if (sentences.length === 0) {
      return {
        average: 0,
        tooLong: [],
        distribution: { short: 0, medium: 0, long: 0 },
      };
    }
    const lengths = sentences.map(s => s.length);
    const average = lengths.reduce((sum, len) => sum + len, 0) / sentences.length;
    // 各文のインデックスを参照し、長さ100文字を超える文を抽出
    const tooLong = sentences
      .map((_, index) => index)
      .filter(i => lengths[i] > 100);

    return {
      average,
      tooLong,
      distribution: {
        short: lengths.filter(l => l < 30).length,
        medium: lengths.filter(l => l >= 30 && l <= 100).length,
        long: lengths.filter(l => l > 100).length,
      },
    };
  }

  /**
   * テキストを段落に分割し、段落構造に関するスコア、問題点、改善案、統計情報（平均段落長、結束性）を解析します。
   *
   * @param text 解析対象のテキスト
   * @returns ParagraphStructureAnalysis 段落構造の特性と改善提案
   */
  private async analyzeParagraphStructure(text: string): Promise<ParagraphStructureAnalysis> {
    const paragraphs = splitParagraphs(text);
    if (paragraphs.length === 0) {
      return {
        score: 0,
        issues: [],
        suggestions: [],
        statistics: { averageLength: 0, coherenceScore: 0 },
      };
    }
    const score = this.calculateParagraphScore(paragraphs);
    return {
      score,
      issues: this.findParagraphIssues(paragraphs),
      suggestions: this.generateParagraphSuggestions(paragraphs),
      statistics: {
        averageLength: paragraphs.reduce((total, p) => total + p.length, 0) / paragraphs.length,
        coherenceScore: this.calculateCoherenceScore(paragraphs),
      },
    };
  }

  /**
   * テキストを単語に分割し、単語の難易度（複雑な単語の割合）、使用されている複雑な単語、
   * 及び改善のための代替候補と統計情報（ユニーク単語数、平均単語長）を解析します。
   *
   * @param text 解析対象のテキスト
   * @returns WordChoiceAnalysis 単語に関する解析結果と改善提案
   */
  private async analyzeWordChoice(text: string): Promise<WordChoiceAnalysis> {
    const tokens = await tokenize(text);
    const difficulty = this.calculateWordDifficulty(tokens);
    return {
      difficulty,
      complexWords: this.findComplexWords(tokens),
      suggestions: this.generateWordSuggestions(tokens),
      statistics: {
        uniqueWords: new Set(tokens).size,
        averageWordLength: tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.length, 0) / tokens.length : 0,
      },
    };
  }

  /**
   * 各解析結果（文、段落、単語）に基づいて、全体の可読性スコアを算出します。
   *
   * @param sentenceAnalysis 文解析の結果
   * @param paragraphAnalysis 段落解析の結果
   * @param wordAnalysis 単語解析の結果
   * @returns 可読性総合スコア（0～100）
   */
  private calculateOverallScore(
    sentenceAnalysis: SentenceLengthAnalysis,
    paragraphAnalysis: ParagraphStructureAnalysis,
    wordAnalysis: WordChoiceAnalysis
  ): number {
    const weights = { sentence: 0.4, paragraph: 0.3, word: 0.3 };
    const sentenceScore = this.calculateSentenceScore(sentenceAnalysis);
    const overall =
      sentenceScore * weights.sentence +
      paragraphAnalysis.score * weights.paragraph +
      (100 - wordAnalysis.difficulty) * weights.word;
    return Math.round(Math.max(0, Math.min(100, overall)));
  }

  /**
   * 各文の平均文字数と理想値（50文字）の乖離から、文のスコアを算出します。
   *
   * @param analysis SentenceLengthAnalysis の結果
   * @returns 文スコア（0～100）
   */
  private calculateSentenceScore(analysis: SentenceLengthAnalysis): number {
    const idealAverage = 50;
    const deviation = Math.abs(analysis.average - idealAverage);
    const baseScore = 100 - (deviation / idealAverage) * 50;
    return Math.max(0, Math.min(100, baseScore));
  }

  /**
   * 段落数の理想値（3段落）との乖離から、段落構造スコアを計算します。
   *
   * @param paragraphs 段落の配列
   * @returns 段落構造スコア（0～100）
   */
  private calculateParagraphScore(paragraphs: string[]): number {
    const idealCount = 3;
    const deviation = Math.abs(paragraphs.length - idealCount);
    return Math.max(0, 100 - deviation * 10);
  }

  /**
   * 段落の長さの一貫性を、平均と標準偏差により評価し、結束性スコアを算出します。
   * 均一な段落長の場合、結束性スコアが高くなります。
   *
   * @param paragraphs 段落の配列
   * @returns 結束性スコア（0～100）
   */
  private calculateCoherenceScore(paragraphs: string[]): number {
    const lengths = paragraphs.map(p => p.length);
    const avg = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
    const std = Math.sqrt(variance);
    const ratio = avg > 0 ? std / avg : 0;
    const coherence = 100 * (1 - ratio);
    return Math.round(Math.max(0, Math.min(100, coherence)));
  }

  /**
   * 単語リストから、複雑な単語（6文字超）の割合を計算し、難易度スコアとして返します。
   *
   * @param tokens 単語の配列
   * @returns 単語難易度（0～100）
   */
  private calculateWordDifficulty(tokens: string[]): number {
    if (tokens.length === 0) return 0;
    const complexCount = tokens.filter(token => token.length > 6).length;
    return Math.round((complexCount / tokens.length) * 100);
  }

  /**
   * 単語リストから、複雑な単語（6文字超）の一覧を抽出します。
   *
   * @param tokens 単語の配列
   * @returns 複雑な単語の文字列配列
   */
  private findComplexWords(tokens: string[]): string[] {
    return tokens.filter(t => t.length > 6);
  }

  /**
   * 複雑な単語に対して、改善提案の候補（ここでは小文字変換例）を生成します。
   *
   * @param tokens 単語の配列
   * @returns 単語とその代替候補のオブジェクト配列
   */
  private generateWordSuggestions(tokens: string[]): { word: string; alternatives: string[] }[] {
    const suggestions: { word: string; alternatives: string[] }[] = [];
    const uniqueTokens = Array.from(new Set(tokens.filter(t => t.length > 6)));
    for (const word of uniqueTokens) {
      suggestions.push({ word, alternatives: [word.toLowerCase()] });
    }
    return suggestions;
  }

  /**
   * 段落の内容から、問題点を抽出します。
   * 例として、段落数が不足している場合や、長すぎる段落が存在する場合に問題点として検出します。
   *
   * @param paragraphs 段落の配列
   * @returns 問題点の説明文字列配列
   */
  private findParagraphIssues(paragraphs: string[]): string[] {
    const issues: string[] = [];
    if (paragraphs.length < 2) {
      issues.push('段落分けが不足しています');
    }
    if (paragraphs.some(p => p.length > 500)) {
      issues.push('長すぎる段落があります');
    }
    return issues;
  }

  /**
   * 段落構造に基づいて、改善のための具体的な提案メッセージを生成します。
   *
   * @param paragraphs 段落の配列
   * @returns 改善提案メッセージの文字列配列
   */
  private generateParagraphSuggestions(paragraphs: string[]): string[] {
    return [
      '段落の長さを均一にすることで読みやすくなります',
      '各段落が1つの主題に焦点を当てているか確認してください',
    ];
  }

  /**
   * 解析結果（文、段落、単語）に基づき、優先して改善すべき点の提案を生成します。
   * 例として、長い文があれば「分割」、段落スコアが低ければ「構造の見直し」、単語難易度が高ければ「表現の平易化」を推奨します。
   *
   * @param sentenceAnalysis 文解析結果
   * @param paragraphAnalysis 段落解析結果
   * @param wordAnalysis 単語解析結果
   * @returns 優先度の高い改善提案メッセージの文字列配列
   */
  private generatePrioritySuggestions(
    sentenceAnalysis: SentenceLengthAnalysis,
    paragraphAnalysis: ParagraphStructureAnalysis,
    wordAnalysis: WordChoiceAnalysis
  ): string[] {
    const suggestions: string[] = [];
    if (sentenceAnalysis.tooLong.length > 0) {
      suggestions.push('長い文を分割して読みやすくしてください');
    }
    if (paragraphAnalysis.score < 70) {
      suggestions.push('段落構造を見直してください');
    }
    if (wordAnalysis.difficulty > 70) {
      suggestions.push('より平易な表現を使用することを検討してください');
    }
    return suggestions;
  }

  /**
   * テキスト全体の特徴および各解析結果に基づき、一般的な改善提案を生成します。
   * 例として、文の平均長が長すぎる場合や平均単語長が高い場合に改善点を提示します。
   *
   * @param text 解析対象のテキスト
   * @param sentenceAnalysis 文解析結果
   * @param paragraphAnalysis 段落解析結果
   * @param wordAnalysis 単語解析結果
   * @returns 一般的な改善提案メッセージの文字列配列
   */
  private generateGeneralSuggestions(
    text: string,
    sentenceAnalysis: SentenceLengthAnalysis,
    paragraphAnalysis: ParagraphStructureAnalysis,
    wordAnalysis: WordChoiceAnalysis
  ): string[] {
    const general: string[] = [];
    // 例: 文が長すぎる場合の提案
    if (sentenceAnalysis.average > 90) {
      general.push('文が長すぎる可能性があります。一文を短くすることを検討してください。');
    }
    // 例: 単語の平均長が高い場合の提案
    const avgWordLen = wordAnalysis.statistics.averageWordLength;
    if (avgWordLen > 6) {
      general.push('平均単語長が長いため、より簡潔な表現を検討してください。');
    }
    if (general.length === 0) {
      general.push('全体的に良好ですが、さらなる明確さを追求してください。');
    }
    return general;
  }
}