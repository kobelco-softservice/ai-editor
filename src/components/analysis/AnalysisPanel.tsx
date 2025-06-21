'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { ReadabilityView } from './ReadabilityView';
import { StyleView } from './StyleView';
import { KeywordView } from './KeywordView';
import { ImprovementView } from './ImprovementView';
import type { TextAnalysis } from '@/types/analysis';

interface AnalysisPanelProps {
  content: string;
  isAnalyzing: boolean;
  error?: Error;
  results?: TextAnalysis | null;
  onAnalyze?: () => void;
  className?: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  content,
  isAnalyzing,
  error,
  results,
  onAnalyze,
  className
}) => {
  const [activeTab, setActiveTab] = useState<string>('readability');

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">文章分析</CardTitle>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        ) : isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-3 text-gray-600">分析中...</span>
          </div>
        ) : results ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="readability">読みやすさ</TabsTrigger>
              <TabsTrigger value="style">文体</TabsTrigger>
              <TabsTrigger value="keywords">キーワード</TabsTrigger>
              <TabsTrigger value="improvements">改善提案</TabsTrigger>
            </TabsList>

            <TabsContent value="readability">
              <ReadabilityView analysis={results.readability} />
            </TabsContent>

            <TabsContent value="style">
              <StyleView analysis={results.style} />
            </TabsContent>

            <TabsContent value="keywords">
              <KeywordView analysis={results.keywords} />
            </TabsContent>

            <TabsContent value="improvements">
              <ImprovementView suggestions={results.improvements} />
            </TabsContent>
          </Tabs>
        ) : content ? (
          <div className="text-center py-8">
            <button
              onClick={onAnalyze}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              分析を開始
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            分析するテキストを入力してください
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;