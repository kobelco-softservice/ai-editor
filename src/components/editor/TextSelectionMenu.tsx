// src/components/editor/TextSelectionMenu.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { buildActionPrompt } from '@/lib/prompts/buildActionPrompt';
import { useEditor } from '@/context/EditorContext';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { SYSTEM_PROMPT, MENU_STRUCTURE } from '@/lib/constants/menu-structure';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// メニューの幅
export const MENU_WIDTH = 500;
// 画面の右端からの余白
export const MENU_MARGIN = 10;
export const TOOLBAR_HEIGHT = 42; // BlockNoteのツールバーの高さ

// MenuPosition interfaceを拡張
export interface MenuPosition {
  x: number;
  y: number;
  height: number; // 選択範囲の高さを追加
}

export interface TextSelectionMenuProps {
  position: MenuPosition;
  selectedText: string;
  onClose: () => void;
}

interface ActiveSubMenu {
  id: string;
  rect: DOMRect;
  action: string;
  options: { value: string; label: string }[];
}

export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({ position, selectedText, onClose }) => {
  const { updateBlockNoteContent } = useEditor();
  const [freeText, setFreeText] = useState('');
  const { result, loading, startStreaming } = useStreamingResponse();
  const { toast } = useToast();
  const [activeSubMenu, setActiveSubMenu] = useState<ActiveSubMenu | null>(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [messages, setMessages] = useState('');
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // TextSelectionMenu.tsx 内で選択範囲を保持
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // メニューがマウントされた時に選択範囲を保存
  useEffect(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
    }
  }, []);

  // // Input要素にフォーカスが当たる前に選択範囲を保存
  // const handleInputFocus = () => {
  //   const selection = window.getSelection();
  //   if (selection && !selection.isCollapsed) {
  //     setSavedRange(selection.getRangeAt(0).cloneRange());
  //   }
  // };

  // Input要素からフォーカスが外れた時に選択範囲を復元
  const handleInputBlur = () => {
    if (savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
    }
  };

  // メニューの位置を計算する関数
  const calculateMenuPosition = () => {
    if (!menuRef.current) return { left: position.x, top: position.y + position.height };


    const menuHeight = menuRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // メニューが画面下部で見切れるかチェック
    const exceedsBottom = position.y + position.height + menuHeight > viewportHeight;

    // メニューが画面右端で見切れるかチェック
    const exceedsRight = position.x + MENU_WIDTH > viewportWidth;

    // 上部に表示する場合、ツールバーとの重なりをチェック
    const topPosition = exceedsBottom
      ? Math.max(TOOLBAR_HEIGHT + MENU_MARGIN, position.y - menuHeight)
      : position.y + position.height + TOOLBAR_HEIGHT; // BlockNoteのメニューの高さを考慮

    return {
      left: exceedsRight
        ? Math.max(MENU_MARGIN, viewportWidth - MENU_WIDTH - MENU_MARGIN)
        : position.x,
      top: topPosition,
    };
  };

  // メニューの位置を更新する
  const [menuPosition, setMenuPosition] = useState(calculateMenuPosition());

  // メニューの位置を再計算
  useEffect(() => {
    const updatePosition = () => {
      setMenuPosition(calculateMenuPosition());
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [position]);

  useEffect(() => {
    if (result) {
      setMessages(result);
    }
  }, [result]);

  if (!selectedText) return null;

  const handleAction = async (action: string, option?: string) => {
    setShowResultPanel(true);
    setActiveSubMenu(null);
    const userPrompt = buildActionPrompt(action, selectedText, option);
    const payload = {
      type: 'menu',
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      action,
      option: option || null,
    };
    await startStreaming(payload);
  };

  const handleApply = (mode: 'replace' | 'insertAbove' | 'insertBelow') => {
    if (result) {
      updateBlockNoteContent({ mode, content: result, selectedText });
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messages)
      .then(() => {
        toast({
          title: "コピー",
          description: "クリップボードにコピーしました",
          variant: "default",
        });
      })
      .catch((err) => {
        toast({
          title: "コピー",
          description: "クリップボードのコピーに失敗しました",
          variant: "destructive",
        });
        // console.error("コピーに失敗しました:", err);
      });
  };

  const startHideSubMenuTimer = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubMenu(null);
    }, 200);
  };

  const clearHideSubMenuTimer = () => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
      submenuTimeoutRef.current = null;
    }
  };

  const handleFreeFormSubmit = async (freeText: string, selected: string) => {
    // console.log(freeText, selected);
    setShowResultPanel(true);
    const userPrompt = buildActionPrompt('freeform', selected, freeText);
    const payload = {
      type: 'menu',
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      action: 'freeform',
      // option: text,
    };
    await startStreaming(payload);
  };

  return (
    <>
      <Card
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}  // メニュー全体のクリックを捕捉
        onMouseDown={(e) => e.stopPropagation()} // マウスダウンイベントも捕捉
        style={{
          position: 'fixed',
          left: menuPosition.left,
          top: menuPosition.top,
          width: '35rem',
          maxWidth: `min(${MENU_WIDTH}px, calc(100vw - ${MENU_MARGIN * 2}px))`,
        }}
        className="z-50 shadow-lg overflow-hidden bg-card text-card-foreground"
      >
        <CardContent className="p-0">
          {!showResultPanel ? (
            <div>
              <div className="p-3 border-b border-border">
                <Input
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="AIに編集や生成を依頼する..."
                  className="bg-muted"
                  // onFocus={handleInputBlur}
                  // onBlur={handleInputBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleInputBlur();
                      handleFreeFormSubmit(freeText, selectedText);
                    }
                  }}
                />
              </div>
              <ScrollArea className="max-h-[20rem] overflow-y-auto" type="always">
                <div className="p-2 space-y-4">
                  {/* 独立メニュー */}
                  {MENU_STRUCTURE.independentItems.map((item, index) => (
                    <div
                      key={`independent-${index}`}
                      className="relative"
                      onMouseEnter={(e) => {
                        clearHideSubMenuTimer();
                        if (item.options) {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setActiveSubMenu({ id: `independent-${index}`, rect, action: item.action, options: item.options });
                        } else {
                          setActiveSubMenu(null);
                        }
                      }}
                      onMouseLeave={startHideSubMenuTimer}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => !item.options && handleAction(item.action)}
                        className="w-full flex items-center gap-3 px-4 py-3 font-normal hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="text-primary">{item.icon}</span>
                        <div className="flex-grow text-left">
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        {item.options && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  ))}
                  {/* カテゴリー別メニュー */}
                  {MENU_STRUCTURE.sections.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="space-y-2">
                      <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                        {section.title}
                      </div>
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={`section-${sectionIndex}-item-${itemIndex}`}
                          className="relative"
                          onMouseEnter={(e) => {
                            clearHideSubMenuTimer();
                            if (item.options) {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setActiveSubMenu({ id: `section-${sectionIndex}-item-${itemIndex}`, rect, action: item.action, options: item.options });
                            } else {
                              setActiveSubMenu(null);
                            }
                          }}
                          onMouseLeave={startHideSubMenuTimer}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => !item.options && handleAction(item.action)}
                            className="w-full flex items-center gap-3 px-4 py-3 font-normal hover:bg-accent hover:text-accent-foreground"
                          >
                            <span className="text-primary">{item.icon}</span>
                            <div className="flex-grow text-left">
                              <div className="text-sm font-medium">{item.label}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                            {item.options && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="p-3 font-medium text-sm border-b border-border">結果</div>
              <ScrollArea className="h-[16rem] overflow-y-auto" type="always">
                <div className="p-4 prose-dark">
                  <ReactMarkdown
                    className="whitespace-normal break-words prose prose-sm dark:prose-invert max-w-none"
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                  >
                    {messages}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Sparkles className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  <div className="p-3 border-b border-border">
                    <Input
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder="結果に対してAIへ指示する..."
                      className="bg-muted"
                      // onFocus={handleInputBlur}
                      // onBlur={handleInputBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleInputBlur();
                          handleFreeFormSubmit(freeText, messages);
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-around p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-primary hover:text-primary hover:bg-accent"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      コピー
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApply('replace')}
                      className="text-primary hover:text-primary hover:bg-accent"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      置換
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApply('insertAbove')}
                      className="text-primary hover:text-primary hover:bg-accent"
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      上に挿入
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApply('insertBelow')}
                      className="text-primary hover:text-primary hover:bg-accent"
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      下に挿入
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeSubMenu &&
        createPortal(
          <Card
            className="shadow-lg w-40 z-50 bg-card text-card-foreground"
            style={{
              position: 'fixed',
              top: Math.max(
                TOOLBAR_HEIGHT + MENU_MARGIN,
                Math.min(
                  activeSubMenu.rect.top,
                  window.innerHeight - 200 // サブメニューの予想高さ
                )
              ),
              left: activeSubMenu.rect.right + 160 > window.innerWidth
                ? activeSubMenu.rect.left - 160
                : activeSubMenu.rect.right - 1,
            }}
            onMouseEnter={clearHideSubMenuTimer}
            onMouseLeave={startHideSubMenuTimer}
          >
            <CardContent className="p-1">
              {activeSubMenu.options.map((option, optIndex) => (
                <Button
                  key={optIndex}
                  variant="ghost"
                  onClick={() => handleAction(activeSubMenu.action, option.value)}
                  className="w-full flex justify-start px-3 py-2 font-normal hover:bg-accent hover:text-accent-foreground"
                >
                  {option.label}
                </Button>
              ))}
            </CardContent>
          </Card>,
          document.body
        )}
    </>
  );
};