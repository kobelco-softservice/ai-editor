'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  ChevronRight, 
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import type { ReadabilityAnalysis } from '@/types/analysis';

interface ReadabilityViewProps {
  analysis: ReadabilityAnalysis;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export const ReadabilityView: React.FC<ReadabilityViewProps> = ({
  analysis,
  onSuggestionClick,
  className
}) => {
  // スコアに基づく色とステータスの決定
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return '良好';
    if (score >= 60) return '改善の余地あり';
    return '要改善';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 総合スコア */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              読みやすさスコア
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {getScoreStatus(analysis.score)}
            </div>
          </div>
          {/* <Progress 
            value={analysis.score} 
            className="mt-4"
          /> */}
        </CardContent>
      </Card>

      {/* 文の長さ分析 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            文の長さ分析
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>平均文長:</span>
              <span className="font-medium">
                {analysis.complexity.sentenceLength.average}文字
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>長い文（要注意）:</span>
              <span className="font-medium text-yellow-500">
                {analysis.complexity.sentenceLength.tooLong.length}箇所
              </span>
            </div>
            {/* 文長の分布 */}
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">文長の分布:</div>
              <div className="flex gap-2">
                {Object.entries(analysis.complexity.sentenceLength.distribution).map(([type, count]) => (
                  <div key={type} className="flex-1 bg-gray-100 p-2 rounded-md text-center">
                    <div className="text-xs text-gray-500">{type}</div>
                    <div className="font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 段落構造分析 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">段落構造</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>構造スコア:</span>
              <div className={`font-medium ${getScoreColor(analysis.complexity.paragraphStructure.score)}`}>
                {analysis.complexity.paragraphStructure.score}点
              </div>
            </div>
            {analysis.complexity.paragraphStructure.issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 改善提案 */}
      {analysis.suggestions.priority.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">優先的な改善点</h3>
            <div className="space-y-3">
              {analysis.suggestions.priority.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span>{suggestion}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* メタデータ */}
      <div className="text-xs text-gray-500 mt-4">
        分析日時: {analysis.metadata.analyzedAt.toLocaleString()}
      </div>
    </div>
  );
};

export default ReadabilityView;