// src/lib/hooks/useAIAnalysis.ts
import { useState, useCallback, useEffect } from "react";

// useAIAnalysis.ts
interface AnalysisResult {
  type: string;
  content: string;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  const analyzeText = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    try {
      // ここでAI分析のAPI呼び出しを行う
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック用
      setAnalysisResults([
        { type: "readability", content: "読みやすさスコア: 85/100" },
        { type: "tone", content: "文体: フォーマル" }
      ]);
    } catch (error) {
      console.error("AI分析エラー:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    analysisResults,
    analyzeText
  };
};
//   // AI分析を管理するフック
//   export const useAIAnalysis = () => {
//     const [isAnalyzing, setIsAnalyzing] = useState(false);
//     const [results, setResults] = useState<Array<{
//       type: string;
//       content: string;
//     }>>([]);
  
//     const analyze = useCallback(async (text: string) => {
//       if (!text) return;
      
//       setIsAnalyzing(true);
//       try {
//         // ここでAI分析のAPIを呼び出す
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         setResults([
//           {
//             type: '読みやすさ',
//             content: '良好: スコア 85/100'
//           },
//           {
//             type: '文体',
//             content: 'フォーマル'
//           },
//           {
//             type: '構造',
//             content: '明確な段落分けがされています'
//           }
//         ]);
//       } catch (error) {
//         console.error('Analysis error:', error);
//       } finally {
//         setIsAnalyzing(false);
//       }
//     }, []);
  
//     useEffect(() => {
//       const debounceTimeout = setTimeout(() => {
//         setResults([]);
//       }, 1000);
  
//       return () => clearTimeout(debounceTimeout);
//     }, []);
  
//     return {
//       isAnalyzing,
//       results,
//       analyze
//     };
//   };
  