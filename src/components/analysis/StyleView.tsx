'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
import {
  Edit,
  MessageSquare,
  AlertCircle,
  Languages
} from 'lucide-react';
import type { StyleAnalysis } from '@/types/analysis';

interface StyleViewProps {
  analysis: StyleAnalysis;
  className?: string;
}

export const StyleView: React.FC<StyleViewProps> = ({
  analysis,
  className
}) => {
  // 一貫性スコアに基づく評価
  const getConsistencyStatus = (score: number) => {
    if (score >= 90) return { text: '非常に一貫性がある', color: 'text-green-500' };
    if (score >= 70) return { text: '概ね一貫性がある', color: 'text-yellow-500' };
    return { text: '一貫性に課題あり', color: 'text-red-500' };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 文体の一貫性 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <Edit className="w-5 h-5 mr-2" />
            文体の一貫性
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span>一貫性スコア</span>
                <span className={getConsistencyStatus(analysis.consistency.score).color}>
                  {analysis.consistency.score}%
                </span>
              </div>
              {/* <Progress value={analysis.consistency.score} /> */}
              <div className="text-sm text-gray-500 mt-1">
                {getConsistencyStatus(analysis.consistency.score).text}
              </div>
            </div>

            {/* 文体の分布 */}
            <div>
              <h4 className="text-sm font-medium mb-2">文体の分布</h4>
              <div className="space-y-2">
                {Object.entries(analysis.consistency.mixedStyles).map(([style, percentage]) => (
                  <div key={style} className="flex items-center space-x-2">
                    <div className="w-24 text-sm">{style}</div>
                    {/* <Progress value={percentage} className="flex-1" /> */}
                    <div className="w-12 text-sm text-right">{percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* トーン分析 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <MessageSquare className="w-5 h-5 mr-2" />
            トーン分析
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>主要なトーン</span>
              <span className="font-medium">{analysis.tone.primary}</span>
            </div>
            
            {/* 感情分析 */}
            <div>
              <h4 className="text-sm font-medium mb-2">感情の分布</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(analysis.tone.emotional).map(([emotion, value]) => (
                  <div key={emotion} className="bg-gray-50 p-2 rounded-md text-center">
                    <div className="text-xs text-gray-500">{emotion}</div>
                    <div className="font-medium">{value}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 形式度 */}
            <div>
              <h4 className="text-sm font-medium mb-2">形式度</h4>
              {/* <Progress value={analysis.tone.formality.level} /> */}
              <div className="text-sm text-gray-500 mt-1">
                {analysis.tone.formality.assessment}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 敬語分析 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <Languages className="w-5 h-5 mr-2" />
            敬語分析
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>敬語レベル</span>
              <span className="font-medium">{analysis.honorifics.level}</span>
            </div>
            {/* <Progress value={analysis.honorifics.consistency} /> */}
            
            {/* 敬語の使用例 */}
            <div className="space-y-2">
              {Object.entries(analysis.honorifics.usage).map(([type, examples]) => (
                <div key={type} className="bg-gray-50 p-3 rounded-md">
                  <h5 className="text-sm font-medium mb-2">{type}</h5>
                  <div className="text-sm text-gray-600">
                    {examples.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 改善提案 */}
      {analysis.suggestions.critical.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">重要な改善点</h3>
            <div className="space-y-3">
              {analysis.suggestions.critical.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* メタデータ */}
      <div className="text-xs text-gray-500 mt-4 flex items-center justify-between">
        <span>主要な文体: {analysis.metadata.dominantStyle}</span>
        <span>分析日時: {analysis.metadata.analyzedAt.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default StyleView;