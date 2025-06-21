'use client'

import React, { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SimpleTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: () => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  fontFamily?: string;
  theme?: 'light' | 'dark';
}

export const SimpleTextEditor = forwardRef<HTMLTextAreaElement, SimpleTextEditorProps>(({
  value = '',
  onChange,
  onSelect,
  placeholder = 'テキストを入力してください...',
  className,
  readOnly = false,
  showLineNumbers = true,
  fontSize = 14,
  fontFamily = 'monospace',
  theme = 'light'
}, forwardedRef) => {
  const [content, setContent] = useState(value);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = forwardedRef || internalRef;
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // コンテンツが変更された時の処理
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // カーソル位置の更新
  const updateCursorPosition = useCallback(() => {
    const currentRef = textareaRef as React.RefObject<HTMLTextAreaElement>;
    const textarea = currentRef?.current;
    if (!textarea) return;
    
    const selectionStart = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\n');
    const lineNumber = lines.length;
    const columnNumber = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line: lineNumber, column: columnNumber });
    onSelect?.();
  }, [onSelect, textareaRef]);

  // スクロール同期
  const handleScroll = useCallback(() => {
    const currentRef = textareaRef as React.RefObject<HTMLTextAreaElement>;
    const textarea = currentRef?.current;
    if (!textarea || !lineNumbersRef.current) return;
    
    const lineNumbers = lineNumbersRef.current;
    lineNumbers.scrollTop = textarea.scrollTop;
  }, [textareaRef]);

  // 行番号の生成
  const generateLineNumbers = useCallback(() => {
    const lines = content.split('\n');
    const lineHeight = fontSize * 1.5;
    return lines.map((_, index) => (
      <div
        key={index}
        className={cn(
          "text-right px-2 select-none",
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          height: `${lineHeight}px`,
          fontFamily,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box'
        }}
      >
        {index + 1}
      </div>
    ));
  }, [content, fontSize, fontFamily, theme]);

  // propsのvalueが変更された時にcontentを更新
  useEffect(() => {
    if (value !== content) {
      setContent(value);
    }
  }, [value, content]);

  // キーボードショートカット
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab文字の挿入
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      
      setContent(newValue);
      onChange?.(newValue);
      
      // カーソル位置を調整
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
    
    // Ctrl+A で全選択
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      const currentRef = textareaRef as React.RefObject<HTMLTextAreaElement>;
      currentRef?.current?.select();
    }
  }, [content, onChange, textareaRef]);

  const editorStyles = {
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize * 1.5}px`,
    fontFamily
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-300';

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* 行番号 */}
      {showLineNumbers && (
        <div
          ref={lineNumbersRef}
          className={cn(
            "flex flex-col border-r overflow-hidden",
            themeClasses,
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
          )}
          style={{
            minWidth: '60px',
            maxHeight: '100%',
            overflowY: 'hidden',
            paddingTop: '16px',
            paddingBottom: '16px'
          }}
        >
          {generateLineNumbers()}
        </div>
      )}

      {/* メインテキストエリア */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onSelect={updateCursorPosition}
          onFocus={updateCursorPosition}
          onClick={updateCursorPosition}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "w-full h-full resize-none outline-none border-0",
            "font-mono leading-relaxed",
            themeClasses,
            readOnly && "cursor-default"
          )}
          style={{
            ...editorStyles,
            padding: '16px',
            margin: 0,
            border: 'none',
            boxSizing: 'border-box'
          }}
          spellCheck={false}
        />
        
        {/* ステータスバー */}
        <div className={cn(
          "absolute bottom-0 right-0 px-2 py-1 text-xs",
          theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
        )}>
          行 {cursorPosition.line}, 列 {cursorPosition.column}
        </div>
      </div>
    </div>
  );
});

SimpleTextEditor.displayName = 'SimpleTextEditor';

export default SimpleTextEditor;
