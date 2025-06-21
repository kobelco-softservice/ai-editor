'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCw,
  ArrowRight
} from 'lucide-react';
import type { ImprovementSuggestions } from '@/types/analysis';

interface ImprovementViewProps {
  suggestions: ImprovementSuggestions;
  onApply?: (improvement: string) => void;
  className?: string;
}

export const ImprovementView: React.FC<ImprovementViewProps> = ({
  suggestions,
  onApply,
  className
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 重要な改善点 */}
      {suggestions.critical.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium flex items-center mb-4">
              <Lightbulb className="w-5 h-5 mr-2" />
              重要な改善点
            </h3>
            <div className="space-y-3">
              {suggestions.critical.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-red-600">{item.type}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </div>
                    </div>
                    <div className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                      優先度: {item.priority}
                    </div>
                  </div>
                  {item.location && item.location.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      該当箇所: {item.location.join(', ')}行目
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 一般的な改善提案 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <RotateCw className="w-5 h-5 mr-2" />
            改善提案
          </h3>
          <div className="space-y-3">
            {suggestions.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  onClick={() => toggleItem(index)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{suggestion.type}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {suggestion.description}
                    </div>
                  </div>
                  {expandedItems.has(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                {expandedItems.has(index) && (
                  <div className="border-t p-3 bg-gray-50">
                    <div className="text-sm">
                      <div className="font-medium mb-2">理由:</div>
                      <div className="text-gray-600">{suggestion.reason}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 改善例 */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            具体的な改善例
          </h3>
          <div className="space-y-4">
            {suggestions.examples.map((example, index) => (
              <div key={index} className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">現在の表現:</div>
                  <div className="text-gray-700">{example.original}</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">改善案:</div>
                  <div className="text-gray-700">{example.improved}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">説明: </span>
                  {example.explanation}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApply?.(example.original)}
                    className="flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    却下
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApply?.(example.improved)}
                    className="flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    適用
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovementView;