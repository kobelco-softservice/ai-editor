import React from 'react';
import {
    Sparkles,
    Languages,
    Scissors,
    ArrowRight,
    Smile,
    BookOpen,
    Pencil,
    Wand2,
    Palette,
    Globe,
    BookMarked,
    Binary,
    FileText,
    CheckCircle2,
    List
  } from 'lucide-react';

export interface MenuOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }
  
export interface MenuItem {
    icon: React.ReactNode;
    label: string;
    action: string;
    description: string;
    options?: MenuOption[];
  }

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface MenuStructure {
  independentItems: MenuItem[];
  sections: MenuSection[];
}

export const SYSTEM_PROMPT = `
あなたは一流の文章の校正・校閲エキスパートです。
以下の要件を必ず守って出力してください：
- 読みやすいように適宜段落や改行を含めること。
- 出力は指示された内容のみとし、説明文や「以下のようになります」などの前置きは一切含めないこと。
- 実装に必要なコードや文章のみを記述し、余計な説明やコメント、追加のテキストは一切含めないこと。
- 出力された内容は、そのまま適用できる完全な形であること。
`;

export const MENU_STRUCTURE: MenuStructure = {
  independentItems: [
    {
      icon: <ArrowRight className="w-4 h-4" />,
      label: '続きを提案',
      description: '文章の続きを提案します',
      action: 'continue'
    }
  ],
  sections: [
    {
      title: '基本操作',
      items: [
        {
          icon: <Scissors className="w-4 h-4" />,
          label: '要約',
          description: '文章を短く要約します',
          action: 'summarize',
          options: [
            { value: 'short', label: '要約', icon: <FileText className="w-4 h-4" /> },
            { value: 'medium', label: '1段落に要約', icon: <BookOpen className="w-4 h-4" /> },
            { value: 'bullets', label: '箇条書きで要約', icon: <List className="w-4 h-4" /> }
          ]
        },
        {
          icon: <Languages className="w-4 h-4" />,
          label: '翻訳',
          description: '他の言語に翻訳します',
          action: 'translate',
          options: [
            { value: 'en', label: '英語', icon: <Globe className="w-4 h-4" /> },
            { value: 'zh', label: '中国語', icon: <Globe className="w-4 h-4" /> },
            { value: 'ko', label: '韓国語', icon: <Globe className="w-4 h-4" /> },
            { value: 'ja', label: '日本語', icon: <Globe className="w-4 h-4" /> }
          ]
        },
        {
          icon: <Smile className="w-4 h-4" />,
          label: 'トーン変更',
          description: '文体を変更します',
          action: 'tone',
          options: [
            { value: 'casual', label: 'カジュアル', icon: <Smile className="w-4 h-4" /> },
            { value: 'formal', label: 'フォーマル', icon: <BookMarked className="w-4 h-4" /> },
            { value: 'business', label: 'ビジネス', icon: <Binary className="w-4 h-4" /> }
          ]
        }
      ]
    },
    {
      title: '文章改善',
      items: [
        {
          icon: <Wand2 className="w-4 h-4" />,
          label: '文章改善',
          description: '表現や語彙を改善します',
          action: 'paraphrase',
          options: [
            { value: 'casual', label: 'カジュアルに', icon: <Smile className="w-4 h-4" /> },
            { value: 'formal', label: 'フォーマルに', icon: <BookMarked className="w-4 h-4" /> }
          ]
        },
        {
          icon: <Palette className="w-4 h-4" />,
          label: '文章再構成',
          description: '構成を変更して読みやすくします',
          action: 'restructure',
          options: [
            { value: 'article', label: '記事形式', icon: <FileText className="w-4 h-4" /> },
            { value: 'academic', label: '学術論文', icon: <BookOpen className="w-4 h-4" /> },
            { value: 'blog', label: 'ブログ記事', icon: <Smile className="w-4 h-4" /> },
            { value: 'report', label: 'レポート', icon: <FileText className="w-4 h-4" /> },
            { value: 'newsletter', label: 'メルマガ', icon: <FileText className="w-4 h-4" /> }
          ]
        },
        {
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: '文法チェック',
          description: '文章の文法・綴りを確認し、修正点を提案します',
          action: 'grammarCheck'
        },
        {
          icon: <BookOpen className="w-4 h-4" />,
          label: 'タイトル生成',
          description: '文章内容からキャッチーなタイトルを生成します',
          action: 'title'
        }
      ]
    },
    {
      title: '詳細改善',
      items: [
        {
          icon: <Pencil className="w-4 h-4" />,
          label: '語彙改善',
          description: 'より適切な語彙に改善します',
          action: 'improveVocabulary'
        },
        {
          icon: <Scissors className="w-4 h-4" />,
          label: '冗長削除',
          description: '不要な表現を削除します',
          action: 'removeRedundancy'
        },
        {
          icon: <Palette className="w-4 h-4" />,
          label: '文体統一',
          description: '文体を一貫性のあるスタイルに統一します',
          action: 'unifyStyle'
        },
        {
          icon: <Sparkles className="w-4 h-4" />,
          label: '創作拡張',
          description: '創造的なアイディアを追加します',
          action: 'creativeExtend'
        }
      ]
    }
  ]
};
