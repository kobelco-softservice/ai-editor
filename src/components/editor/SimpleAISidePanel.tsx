'use client'

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
    Sparkles,
    ChevronRight,
    ArrowDown,
    ArrowUp,
    Copy,
    X,
    ReplaceIcon,
} from 'lucide-react';
import { buildActionPrompt } from '@/lib/prompts/buildActionPrompt';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { SYSTEM_PROMPT, MENU_STRUCTURE, MenuOption } from '@/lib/constants/simple-menu-structure';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeText } from '@/lib/utils/text-processing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SimpleAISidePanelProps {
    content: string;
    selectedText?: string;
    onApply: (mode: 'replace' | 'insertAbove' | 'insertBelow', result: string) => void;
}

export interface SimpleAISidePanelRef {
    executeAction: (action: string, option?: MenuOption | string) => Promise<void>;
}

export const SimpleAISidePanel = forwardRef<SimpleAISidePanelRef, SimpleAISidePanelProps>(({
    content,
    selectedText,
    onApply
}, ref) => {
    const [freeText, setFreeText] = useState('');
    const { result, loading, startStreaming } = useStreamingResponse();
    const { toast } = useToast();
    const [messages, setMessages] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (result) {
            setMessages(result);
        }
    }, [result]);

    useEffect(() => {
        if (messages && showResult) {
            resultRef.current?.scrollIntoView({ 
                behavior: 'smooth'
            });
        }
    }, [messages, showResult]);

    const handleAction = useCallback(async (action: string, option?: MenuOption | string) => {
        if (loading) {
            return;
        }

        let targetText = '';
        if (selectedText) {
            targetText = selectedText;
        } else if (content) {
            targetText = content;
        }

        targetText = normalizeText(targetText);

        if (!targetText || targetText.trim() === '') {
            toast({
                title: "エラー",
                description: "テキストがありません",
                variant: "destructive",
            });
            return;
        }

        setShowResult(true);
        setMessages('');

        const userPrompt = buildActionPrompt(action, targetText, option?.toString());
        
        const payload = {
            type: 'menu',
            systemPrompt: SYSTEM_PROMPT,
            userPrompt,
            action,
            option: option || null,
        };

        await startStreaming(payload);
    }, [loading, selectedText, content, toast, startStreaming]);

    // refを通じて外部からhandleActionを呼び出せるようにする
    useImperativeHandle(ref, () => ({
        executeAction: handleAction
    }), [handleAction]);

    const handleCopy = () => {
        navigator.clipboard.writeText(messages)
            .then(() => {
                toast({
                    title: "コピー",
                    description: "クリップボードにコピーしました",
                    variant: "default",
                });
            })
            .catch(() => {
                toast({
                    title: "コピー",
                    description: "クリップボードのコピーに失敗しました",
                    variant: "destructive",
                });
            });
    };

    const handleApply = (mode: 'replace' | 'insertAbove' | 'insertBelow') => {
        if (result) {
            onApply(mode, result);
            toast({
                title: "適用完了",
                description: "テキストに適用しました",
                variant: "default",
            });
        }
    };

    const toggleSubMenu = (menuId: string) => {
        setExpandedMenuId(expandedMenuId === menuId ? null : menuId);
    };

    const MenuItemButton: React.FC<{
        icon?: React.ReactNode;
        label: string;
        description?: string;
        hasSubmenu?: boolean;
        isExpanded?: boolean;
        onClick: () => void;
        className?: string;
    }> = ({ icon, label, description, hasSubmenu, isExpanded, onClick, className }) => {
        return (
            <Button
                variant="ghost"
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 font-normal hover:bg-accent hover:text-accent-foreground ${className}`}
            >
                {icon && <span className="text-primary">{icon}</span>}
                <div className="flex-grow text-left">
                    <div className="text-sm font-medium">{label}</div>
                    {description && <div className="text-xs text-muted-foreground">{description}</div>}
                </div>
                {hasSubmenu && (
                    <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                )}
            </Button>
        );
    };

    return (
        <div className="h-full bg-background border-l border-border flex flex-col">
            <div className="p-2 py-4 flex flex-col h-full">
                {/* 入力エリア */}
                <div className="flex items-center gap-2 bg-muted rounded-md">
                    <Sparkles className="w-4 h-4 ml-3 text-muted-foreground" />
                    <Input
                        type="text"
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        placeholder="AIへの指示を入力..."
                        className="bg-transparent border-none focus-visible:ring-0"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAction('freeform', freeText);
                            }
                        }}
                    />
                </div>

                {/* メニューエリアと結果表示エリアをスクロール可能な領域に */}
                <ScrollArea className="flex-1 mt-4">
                    <div className="space-y-4">
                        {/* メニュー部分 */}
                        <div className="space-y-4">
                            {/* 独立メニュー */}
                            {MENU_STRUCTURE.independentItems.map((item, index) => (
                                <div
                                    key={`independent-${index}`}
                                    className="relative"
                                >
                                    <MenuItemButton
                                        icon={item.icon}
                                        label={item.label}
                                        description={item.description}
                                        hasSubmenu={!!item.options}
                                        isExpanded={expandedMenuId === `independent-${index}`}
                                        onClick={() => {
                                            if (item.options) {
                                                toggleSubMenu(`independent-${index}`);
                                            } else {
                                                handleAction(item.action);
                                            }
                                        }}
                                    />
                                    {item.options && expandedMenuId === `independent-${index}` && (
                                        <div className="ml-8 mt-2 space-y-1 bg-muted/50 rounded-md p-2">
                                            {item.options.map((option, optIndex) => (
                                                <Button
                                                    key={optIndex}
                                                    variant="ghost"
                                                    onClick={() => handleAction(item.action, option)}
                                                    className="w-full flex items-center gap-2 justify-start text-sm py-2 px-4 h-auto font-normal hover:bg-accent/50"
                                                >
                                                    {option.icon && <span className="text-primary">{option.icon}</span>}
                                                    <span>{typeof option === 'object' ? option.label : option}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
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
                                        >
                                            <MenuItemButton
                                                icon={item.icon}
                                                label={item.label}
                                                description={item.description}
                                                hasSubmenu={!!item.options}
                                                isExpanded={expandedMenuId === `section-${sectionIndex}-item-${itemIndex}`}
                                                onClick={() => {
                                                    if (item.options) {
                                                        toggleSubMenu(`section-${sectionIndex}-item-${itemIndex}`);
                                                    } else {
                                                        handleAction(item.action);
                                                    }
                                                }}
                                            />
                                            {item.options && expandedMenuId === `section-${sectionIndex}-item-${itemIndex}` && (
                                                <div className="ml-8 mt-2 space-y-1">
                                                    {item.options.map((option, optIndex) => (
                                                        <Button
                                                            key={optIndex}
                                                            variant="ghost"
                                                            onClick={() => handleAction(item.action, option.value)}
                                                            className="w-full flex items-center gap-2 justify-start text-sm py-2 px-4 h-auto font-normal"
                                                        >
                                                            {option.icon && <span className="text-primary">{option.icon}</span>}
                                                            <span>{typeof option === 'object' ? option.label : option}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* 結果表示エリア */}
                        {showResult && (
                            <div className="mt-4 border rounded-lg bg-muted/30 m-4 space-y-4">
                                <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                                    <h3 className="text-sm font-medium">結果</h3>
                                    <div className="flex gap-1">
                                        {!loading && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleCopy}
                                                            className="text-primary hover:text-primary hover:bg-accent"
                                                        >
                                                            <Copy className="w-4 h-4 mr-1" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>コピー</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApply('replace')}
                                                            className="text-primary hover:text-primary hover:bg-accent"
                                                        >
                                                            <ReplaceIcon className="w-4 h-4 mr-1" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>置換</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApply('insertAbove')}
                                                            className="text-primary hover:text-primary hover:bg-accent"
                                                        >
                                                            <ArrowUp className="w-4 h-4 mr-1" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>上に挿入</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApply('insertBelow')}
                                                            className="text-primary hover:text-primary hover:bg-accent"
                                                        >
                                                            <ArrowDown className="w-4 h-4 mr-1" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>下に挿入</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowResult(false)}
                                                            className="h-8"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>閉じる</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="prose prose-sm max-w-none dark:prose-invert max-h-[400px] overflow-y-auto">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                        >
                                            {messages}
                                        </ReactMarkdown>
                                        {loading && (
                                            <div className="flex items-center justify-center p-2">
                                                <Sparkles className="w-5 h-5 animate-spin text-primary" />
                                            </div>
                                        )}
                                        <div ref={resultRef} className="h-px" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
});

SimpleAISidePanel.displayName = 'SimpleAISidePanel';
