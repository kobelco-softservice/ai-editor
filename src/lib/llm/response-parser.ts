// src/lib/llm/response-parser.ts

// import type {
//     ReadabilityAnalysis,
//     StyleAnalysis,
//     TextAnalysis,
//     AnalysisError
//   } from '@/types/analysis';
  
  interface ParserOptions {
    strict?: boolean;  // 厳密なパース（必須フィールドの検証）を行うかどうか
    defaultLanguage?: string;  // デフォルトの言語設定
  }
  
  // class ParseError extends Error {
  //   constructor(
  //     message: string,
  //     public fieldPath?: string,
  //     public rawValue?: any
  //   ) {
  //     super(message);
  //     this.name = 'ParseError';
  //   }
  // }
  
  export class ResponseParser {
    parseReadabilityAnalysis(readabilityResult: string): any {
      throw new Error('Method not implemented.');
    }
    parseStyleAnalysis(styleResult: string): any {
      throw new Error('Method not implemented.');
    }
    private strict: boolean;
    private defaultLanguage: string;
  
    constructor(options: ParserOptions = {}) {
      this.strict = options.strict ?? false;
      this.defaultLanguage = options.defaultLanguage ?? 'ja';
    }
  
    // public parseReadabilityAnalysis(response: string): ReadabilityAnalysis {
    //   try {
    //     const parsed = this.parseJSON(response);
    //     this.validateReadabilityAnalysis(parsed);
  
    //     return {
    //       score: this.normalizeScore(parsed.score),
    //       complexity: {
    //         sentenceLength: this.parseSentenceLength(parsed.complexity?.sentenceLength),
    //         paragraphStructure: this.parseParagraphStructure(parsed.complexity?.paragraphStructure),
    //         wordChoice: this.parseWordChoice(parsed.complexity?.wordChoice)
    //       },
    //       suggestions: {
    //         priority: Array.isArray(parsed.suggestions?.priority) 
    //           ? parsed.suggestions.priority
    //           : [],
    //         general: Array.isArray(parsed.suggestions?.general)
    //           ? parsed.suggestions.general
    //           : []
    //       },
    //       metadata: {
    //         analyzedAt: new Date(),
    //         languageCode: parsed.metadata?.languageCode || this.defaultLanguage,
    //         textLength: parsed.metadata?.textLength || 0
    //       }
    //     };
    //   } catch (error) {
    //     throw this.handleParseError(error, 'readability');
    //   }
    // }
  
    // public parseStyleAnalysis(response: string): StyleAnalysis {
    //   try {
    //     const parsed = this.parseJSON(response);
    //     this.validateStyleAnalysis(parsed);
  
    //     return {
    //       consistency: {
    //         score: this.normalizeScore(parsed.consistency?.score),
    //         mixedStyles: this.normalizeMixedStyles(parsed.consistency?.mixedStyles),
    //         patterns: Array.isArray(parsed.consistency?.patterns)
    //           ? parsed.consistency.patterns
    //           : []
    //       },
    //       tone: {
    //         primary: parsed.tone?.primary || 'neutral',
    //         variations: Array.isArray(parsed.tone?.variations)
    //           ? parsed.tone.variations
    //           : [],
    //         emotional: this.normalizeEmotionalScores(parsed.tone?.emotional),
    //         formality: {
    //           level: this.normalizeScore(parsed.tone?.formality?.level),
    //           assessment: parsed.tone?.formality?.assessment || ''
    //         }
    //       },
    //       honorifics: {
    //         level: parsed.honorifics?.level || 'none',
    //         consistency: this.normalizeScore(parsed.honorifics?.consistency),
    //         inconsistencies: Array.isArray(parsed.honorifics?.inconsistencies)
    //           ? parsed.honorifics.inconsistencies
    //           : [],
    //         usage: this.normalizeHonorificUsage(parsed.honorifics?.usage)
    //       },
    //       suggestions: {
    //         critical: Array.isArray(parsed.suggestions?.critical)
    //           ? parsed.suggestions.critical
    //           : [],
    //         recommended: Array.isArray(parsed.suggestions?.recommended)
    //           ? parsed.suggestions.recommended
    //           : [],
    //         examples: Array.isArray(parsed.suggestions?.examples)
    //           ? parsed.suggestions.examples
    //           : []
    //       },
    //       metadata: {
    //         dominantStyle: parsed.metadata?.dominantStyle || 'formal',
    //         analyzedAt: new Date()
    //       }
    //     };
    //   } catch (error) {
    //     throw this.handleParseError(error, 'style');
    //   }
    // }
  
    // private parseJSON(response: string): any {
    //   try {
    //     return JSON.parse(response);
    //   } catch (error) {
    //     throw new ParseError('Invalid JSON response', undefined, response);
    //   }
    // }
  
    // private validateReadabilityAnalysis(data: any): void {
    //   if (this.strict) {
    //     if (typeof data.score !== 'number') {
    //       throw new ParseError('Missing or invalid score', 'score', data.score);
    //     }
    //     if (!data.complexity || typeof data.complexity !== 'object') {
    //       throw new ParseError('Missing complexity object', 'complexity', data.complexity);
    //     }
    //   }
    // }
  
    // private validateStyleAnalysis(data: any): void {
    //   if (this.strict) {
    //     if (!data.consistency || typeof data.consistency !== 'object') {
    //       throw new ParseError('Missing consistency object', 'consistency', data.consistency);
    //     }
    //     if (!data.tone || typeof data.tone !== 'object') {
    //       throw new ParseError('Missing tone object', 'tone', data.tone);
    //     }
    //   }
    // }
  
    // private normalizeScore(score: any): number {
    //   if (typeof score !== 'number' || isNaN(score)) {
    //     return 0;
    //   }
    //   return Math.max(0, Math.min(100, score));
    // }
  
    // private parseSentenceLength(data: any = {}): any {
    //   return {
    //     average: typeof data.average === 'number' ? data.average : 0,
    //     tooLong: Array.isArray(data.tooLong) ? data.tooLong : [],
    //     distribution: {
    //       short: data.distribution?.short || 0,
    //       medium: data.distribution?.medium || 0,
    //       long: data.distribution?.long || 0
    //     }
    //   };
    // }
  
    // private parseParagraphStructure(data: any = {}): any {
    //   return {
    //     score: this.normalizeScore(data.score),
    //     issues: Array.isArray(data.issues) ? data.issues : [],
    //     suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    //     statistics: {
    //       averageLength: data.statistics?.averageLength || 0,
    //       coherenceScore: data.statistics?.coherenceScore || 0
    //     }
    //   };
    // }
  
    // private parseWordChoice(data: any = {}): any {
    //   return {
    //     difficulty: this.normalizeScore(data.difficulty),
    //     complexWords: Array.isArray(data.complexWords) ? data.complexWords : [],
    //     suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    //     statistics: {
    //       uniqueWords: data.statistics?.uniqueWords || 0,
    //       averageWordLength: data.statistics?.averageWordLength || 0
    //     }
    //   };
    // }
  
    // private normalizeMixedStyles(styles: any = {}): Record<string, number> {
    //   const normalized: Record<string, number> = {};
    //   for (const [key, value] of Object.entries(styles)) {
    //     normalized[key] = this.normalizeScore(value);
    //   }
    //   return normalized;
    // }
  
    // private normalizeEmotionalScores(emotional: any = {}): Record<string, number> {
    //   return {
    //     positive: this.normalizeScore(emotional.positive),
    //     negative: this.normalizeScore(emotional.negative),
    //     neutral: this.normalizeScore(emotional.neutral)
    //   };
    // }
  
    // private normalizeHonorificUsage(usage: any = {}): Record<string, string[]> {
    //   return {
    //     respectful: Array.isArray(usage?.respectful) ? usage.respectful : [],
    //     humble: Array.isArray(usage?.humble) ? usage.humble : [],
    //     polite: Array.isArray(usage?.polite) ? usage.polite : []
    //   };
    // }
  
    // private handleParseError(error: any, context: string): never {
    //   if (error instanceof ParseError) {
    //     throw new AnalysisError(
    //       `Failed to parse ${context} analysis: ${error.message}`,
    //       'parse_error',
    //       'error'
    //     );
    //   }
    //   throw new AnalysisError(
    //     `Unexpected error parsing ${context} analysis`,
    //     'unknown_error',
    //     'error'
    //   );
    // }
  }