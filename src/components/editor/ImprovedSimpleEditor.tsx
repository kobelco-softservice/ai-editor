'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { SimpleTextEditor } from './SimpleTextEditor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Download, Save, FileText, Bot, Command, 
  Sparkles, RefreshCw, Wand2, MessageSquare,
  Palette, Type, Eye, Maximize2, Minimize2, BarChart3,
  Copy, Check
} from 'lucide-react';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { useToast } from '@/hooks/use-toast';

interface SelectedText {
  text: string;
  start: number;
  end: number;
}

interface AIAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const ImprovedSimpleEditor: React.FC = () => {
  const [content, setContent] = useState(`# AIテキストエディター

このエディターはAI機能を統合したシンプルなテキストエディターです。

## 使い方:
1. テキストを選択してAI機能を使用
2. Cmd/Ctrl + K でコマンドパレットを開く
3. 右側のAIパネルで文章を改善

## AI機能例:
- テキストの要約
- 文章の改善
- 翻訳
- 続きを書く

サンプルテキスト：
人工知能（AI）は、人間の知能を模倣する技術です。機械学習、深層学習、自然言語処理などの技術を組み合わせて、様々なタスクを自動化することができます。
`);

  // UI状態
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [readOnly, setReadOnly] = useState(false);

  // AI機能状態
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // AI処理状態
  const { result, loading, startStreaming } = useStreamingResponse();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // AI機能のオプション
  const aiActions: AIAction[] = useMemo(() => [
    { id: 'improve', label: '文章を改善', icon: <Wand2 className="w-4 h-4" />, description: '文章をより読みやすく改善します' },
    { id: 'summarize', label: '要約', icon: <BarChart3 className="w-4 h-4" />, description: 'テキストを簡潔に要約します' },
    { id: 'translate', label: '英語に翻訳', icon: <RefreshCw className="w-4 h-4" />, description: '日本語を英語に翻訳します' },
    { id: 'continue', label: '続きを書く', icon: <Sparkles className="w-4 h-4" />, description: 'テキストの続きを生成します' },
    { id: 'explain', label: '説明', icon: <MessageSquare className="w-4 h-4" />, description: 'テキストの内容を説明します' },
  ], []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowContextMenu(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // テキスト選択の処理
  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const text = content.substring(start, end);
      setSelectedText({ text, start, end });
    } else {
      setSelectedText(null);
      setShowContextMenu(false);
    }
  }, [content]);

  // コンテキストメニューの表示
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (selectedText) {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  }, [selectedText]);

  // AI処理の実行
  const executeAIAction = useCallback(async (actionId: string, text?: string, usePopup: boolean = false) => {
    const targetText = text || selectedText?.text || content;
    
    if (!targetText.trim()) {
      toast({
        title: "エラー",
        description: "処理するテキストがありません",
        variant: "destructive",
      });
      return;
    }

    setShowCommandPalette(false);
    setShowContextMenu(false);

    if (usePopup) {
      // ポップアップ表示でAI処理を実行
      setShowAIAssistant(true);

      const prompts = {
        improve: `以下のテキストをより読みやすく、わかりやすく改善してください:\n\n${targetText}`,
        summarize: `以下のテキストを簡潔に要約してください:\n\n${targetText}`,
        translate: `以下の日本語テキストを自然な英語に翻訳してください:\n\n${targetText}`,
        continue: `以下のテキストの自然な続きを書いてください:\n\n${targetText}`,
        explain: `以下のテキストの内容をわかりやすく説明してください:\n\n${targetText}`,
      };

      const payload = {
        type: 'menu',
        systemPrompt: 'あなたは優秀な文章アシスタントです。ユーザーの要求に応じて、適切で有用な回答を提供してください。',
        userPrompt: prompts[actionId as keyof typeof prompts] || `以下のテキストに対して「${actionId}」を実行してください:\n\n${targetText}`,
        action: actionId,
      };

      await startStreaming(payload);
    } 
    // usePopupがfalseのときのみトースト表示
    if (!usePopup) {
      toast({
        title: "AI処理開始",
        description: `${aiActions.find(a => a.id === actionId)?.label || actionId}を実行します`,
      });
    }
  }, [selectedText, content, toast, aiActions, startStreaming]);

  // 結果の適用
  const applyResult = useCallback((mode: 'replace' | 'append' | 'copy') => {
    if (!result) return;

    switch (mode) {
      case 'replace':
        if (selectedText) {
          const newContent = content.substring(0, selectedText.start) + 
                           result + 
                           content.substring(selectedText.end);
          setContent(newContent);
        } else {
          setContent(result);
        }
        break;
      case 'append':
        setContent(content + '\n\n' + result);
        break;
      case 'copy': {
        // 画面上の結果を自動選択・コピー・解除
        if (resultRef.current) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(resultRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
          try {
            document.execCommand('copy');
            toast({
              title: "コピー完了",
              description: "結果をクリップボードにコピーしました",
            });
          } catch {
            toast({
              title: "コピー失敗",
              description: "クリップボードへのコピーに失敗しました。手動で選択してコピーしてください。",
              variant: "destructive",
            });
          }
          // 選択解除
          selection?.removeAllRanges();
        }
        break;
      }
    }
    setSelectedText(null);
  }, [result, selectedText, content, toast]);

  // ファイル操作
  const handleSave = () => {
    console.log('保存:', content);
    toast({
      title: "保存完了",
      description: "ドキュメントを保存しました",
    });
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsFullscreen(false)}
                variant="ghost"
                size="sm"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">フルスクリーンモード</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCommandPalette(true)}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Command className="w-4 h-4" />
                AI機能
              </Button>
            </div>
          </div>
          <SimpleTextEditor
            value={content}
            onChange={setContent}
            showLineNumbers={showLineNumbers}
            fontSize={fontSize}
            theme={theme}
            className="flex-1"
          />
        </div>
        {/* フルスクリーン時もグローバルダイアログを描画 */}
        <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Command className="w-5 h-5" />
                AI機能を選択
              </DialogTitle>
              <DialogDescription>
                キーボードショートカットまたはクリックで機能を実行できます
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {aiActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  className="justify-start h-auto p-4"
                  onClick={() => executeAIAction(action.id, undefined, true)}
                  disabled={loading}
                >
                  <div className="flex items-center gap-3 w-full">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AIアシスタント
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              </DialogTitle>
              <DialogDescription>
                AI処理の結果を確認し、テキストに適用できます
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
              {result && (
                <div ref={resultRef} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              )}
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">AI処理中...</span>
                </div>
              )}
            </div>
            {result && !loading && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => applyResult('replace')}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  置換
                </Button>
                <Button
                  onClick={() => applyResult('append')}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  追加
                </Button>
                <Button
                  onClick={() => applyResult('copy')}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  コピー
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            AIテキストエディター
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCommandPalette(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Command className="w-4 h-4" />
              コマンドパレット
            </Button>
            <Button
              onClick={() => setIsFullscreen(true)}
              variant="outline"
              size="sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              保存
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              エクスポート
            </Button>
          </div>
        </div>
        
        {/* ツールバー */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t">
          <div className="flex items-center gap-4">
            {/* テーマ切り替え */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                ライト
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                ダーク
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* フォントサイズ */}
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              >
                -
              </Button>
              <span className="text-sm w-8 text-center">{fontSize}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              >
                +
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* 表示設定 */}
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <Button
                variant={showLineNumbers ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
              >
                行番号
              </Button>
              <Button
                variant={readOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReadOnly(!readOnly)}
              >
                読み取り専用
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {content.length}文字 | {content.split('\n').length}行
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* メインエディター */}
        <div className="flex-1 flex flex-col min-h-0">
          <div 
            className="flex-1 overflow-hidden" 
            onContextMenu={handleContextMenu}
          >
            <SimpleTextEditor
              ref={textareaRef}
              value={content}
              onChange={setContent}
              onSelect={handleTextSelection}
              showLineNumbers={showLineNumbers}
              fontSize={fontSize}
              theme={theme}
              readOnly={readOnly}
              className="h-full"
            />
          </div>
        </div>

        
      </div>

      {/* コマンドパレット */}
      <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5" />
              AI機能を選択
            </DialogTitle>
            <DialogDescription>
              キーボードショートカットまたはクリックで機能を実行できます
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {aiActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="justify-start h-auto p-4"
                onClick={() => executeAIAction(action.id, undefined, true)}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  {action.icon}
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* コンテキストメニュー */}
      {showContextMenu && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2"
          style={{ 
            left: contextMenuPosition.x, 
            top: contextMenuPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {/* AIアクション全表示 */}
          {aiActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start px-3 py-2 gap-2"
              onClick={() => executeAIAction(action.id, undefined, true)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
          {/* 標準編集操作 */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-3 py-2 gap-2"
            onClick={() => {
              document.execCommand('copy');
              setShowContextMenu(false);
            }}
          >
            <Copy className="w-4 h-4" />
            コピー
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-3 py-2 gap-2"
            onClick={() => {
              document.execCommand('cut');
              setShowContextMenu(false);
            }}
          >
            <FileText className="w-4 h-4" />
            カット
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-3 py-2 gap-2"
            onClick={() => {
              document.execCommand('paste');
              setShowContextMenu(false);
            }}
          >
            <Save className="w-4 h-4" />
            ペースト
          </Button>
        </div>
      )}

      {/* AIアシスタントパネル */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AIアシスタント
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </DialogTitle>
            <DialogDescription>
              AI処理の結果を確認し、テキストに適用できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
            {result && (
              <div ref={resultRef} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            )}
            
            {loading && (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="ml-2">AI処理中...</span>
              </div>
            )}
          </div>

          {result && !loading && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => applyResult('replace')}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                置換
              </Button>
              <Button
                onClick={() => applyResult('append')}
                variant="outline"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                追加
              </Button>
              <Button
                onClick={() => applyResult('copy')}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                コピー
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovedSimpleEditor;
