'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
import {
  Key,
  Hash,
  TrendingUp,
  ArrowRight,
  Plus,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import type { KeywordAnalysis } from '@/types/analysis';

interface KeywordViewProps {
  analysis: KeywordAnalysis;
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

export const KeywordView: React.FC<KeywordViewProps> = ({
  analysis,
  onKeywordClick,
  className
}) => {
  // キーワードの重要度に基づく背景色の取得
  const getImportanceColor = (importance: number) => {
    if (importance >= 0.8) return 'bg-blue-100 text-blue-800';
    if (importance >= 0.5) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* メイントピック */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <Hash className="w-5 h-5 mr-2" />
            メイントピック
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.mainTopics.map((topic, index) => (
              <div
                key={index}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {topic}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* キーワード分析 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <Key className="w-5 h-5 mr-2" />
            重要キーワード
          </h3>
          <div className="space-y-3">
            {analysis.keywords.map((keyword, index) => (
              <div
                key={index}
                onClick={() => onKeywordClick?.(keyword.word)}
                className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${getImportanceColor(keyword.importance)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{keyword.word}</span>
                  <span className="text-sm">
                    出現頻度: {keyword.frequency}回
                  </span>
                </div>
                {/* <Progress
                  value={keyword.importance * 100}
                  className="h-1"
                /> */}
                {keyword.context.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="text-gray-600">使用コンテキスト:</div>
                    <div className="mt-1 space-y-1">
                      {keyword.context.map((ctx, idx) => (
                        <div key={idx} className="flex items-center">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          {ctx}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* キーワードに関する提案 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2" />
            キーワード改善提案
          </h3>
          
          {/* 追加推奨キーワード */}
          {analysis.suggestions.missing.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Plus className="w-4 h-4 mr-1" />
                追加を推奨するキーワード
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestions.missing.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 過剰使用キーワード */}
          {analysis.suggestions.overused.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                使用頻度が高すぎるキーワード
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestions.overused.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 代替案 */}
          {analysis.suggestions.alternatives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium flex items-center mb-2">
                <RefreshCw className="w-4 h-4 mr-1" />
                代替キーワードの提案
              </h4>
              <div className="space-y-2">
                {analysis.suggestions.alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-50 p-2 rounded-md"
                  >
                    <span className="text-gray-600">{alt.original}</span>
                    <ArrowRight className="w-4 h-4 mx-2" />
                    <div className="flex flex-wrap gap-1">
                      {alt.suggested.map((suggestion, idx) => (
                        <span
                          key={idx}
                          className="bg-white px-2 py-1 rounded text-sm"
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KeywordView;