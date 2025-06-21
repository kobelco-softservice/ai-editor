'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Info, Sparkles } from 'lucide-react';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

interface ContentGeneratorFormProps {
    onInsert?: (text: string) => void;
  }

export const ContentGeneratorForm = ({onInsert}:ContentGeneratorFormProps) => {
    const [freeText, setFreeText] = useState('');
    const [additionalText, setAdditionalText] = useState('');
    const [tone, setTone] = useState('フォーマル');
    const [wordCount, setWordCount] = useState('1000');
    const [audience, setAudience] = useState('指定しない');
    const [language, setLanguage] = useState('日本語');
    const [outputFormat, setOutputFormat] = useState('文章');
    const { result, loading, startStreaming } = useStreamingResponse();
    const { toast } = useToast();
    // 生成された文章表示用の状態
    const [generatedText, setGeneratedText] = useState('');
    // API呼び出し中かどうかのフラグ
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // 新たに生成AIの役割を選択するための状態を追加
    const [aiRole, setAiRole] = useState('熟練したライター');

    // AIの役割ごとに定義するsystem promptのマッピング
    const systemPrompts: { [key: string]: string } = {
        '熟練したライター': 'あなたは熟練したライターです。プロンプトの指示に誠実に従って、正しい日本語で魅力的な文章を生成してください。',
        '熟練編集者': 'あなたは熟練編集者です。文章の構成や表現に細心の注意を払い、正しい日本語で洗練された文章を作成してください。',
        '技術専門家': 'あなたは技術専門家です。専門的な知識と正確さを備えた、正しい日本語で文章を生成してください。',
        'マーケティングスペシャリスト': 'あなたはマーケティングスペシャリストです。ターゲットに響く説得力のある文章を意識し、正しい日本語で作成してください。',
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [generatedText]);

    useEffect(() => {
        if (result) {
            setGeneratedText(result);
        }
    }, [result]);

    useEffect(() => {
        setIsGenerating(loading);
    }, [loading]);

    /**
     * ユーザーの入力情報に基づいて
     * 生成AIへ送るためのプロンプトを作成する
     */
    const generatePrompt = (): string => {
        let prompt = '';

        if (outputFormat === 'スライド') {
            // prompt += `以下の条件に沿って${language}で「${outputFormat}」をMarp形式のMarkdownスライド文章を生成してください。\n`;
            // prompt += `・改ページは「---」で表現してください。\n`;
            // prompt += `・見出しは「#」で表現してください。\n`;
            // prompt += `・箇条書きは「-」で表現してください。\n`;

// prompt = `あなたは、Marp形式のスライドを作成する専門家です。以下の文章を読み、Markdown形式のスライドに変換してください。
// **スライドの目的:** [スライドの目的を記述]
// **文章の内容:** [以下の文章を記述]
// ---
// **出力形式の指示:**
// * スライドの構成は、タイトルスライド、目次、各章立て、要約、質疑応答の順にしてください。
// * 各章立ては、スライドのタイトルに沿って構成し、箇条書きや図表を適宜使用してわかりやすく表示してください。
// * 各スライドのコンテンツは、箇条書き、重要な単語の強調（太字、斜体など）を活用して、分かりやすく表示してください。
// * コードブロックや図表（データが明確に示せる場合）も適宜利用してください。
// * 各スライドの改ページは --- で示してください。
// * Marp形式のMarkdownフォーマットで出力してください。
// * 各章立てのスライドを作成してください。章立ては、以下の通りです。
//     *  [章立て1]
//     *  [章立て2]
//     *  [章立て3]
// ---
// **出力言語:** ${language}`;

prompt =`あなたは、Marp形式のスライドを作成する専門家です。
以下の文章を良く理解して内容を構成したうえで、Marpフォーマットのスライドに変換してください。
要件：
1. スライド構造
- 最初のスライドはタイトルスライドとして作成
- 目次スライドを2枚目に配置
- 各セクションの開始時に見出しスライドを挿入
- 1スライドあたり3-4つのポイントを目安に内容を分割

2. フォーマット
- Marpのヘッダー設定を含める
- 各スライドは --- で区切る
- 見出しレベルは適切な階層構造を維持（#, ##, ###）
- 箇条書きは重要なポイントのみに使用

3. デザイン
- 背景色は白を基調とし、テーマは「default」を使用
- 重要な箇所は **太字** で強調
- 図表が必要な箇所では <!-- 図表の挿入位置 --> とコメントを記載

4. その他の要件
- スライド番号を自動的に付与
- フッターにはセクション名を表示

追加の注意点：
- 文章の論理構造を維持しつつ、視覚的に分かりやすい形式に変換してください
- 長い段落は箇条書きや図表を用いて簡潔に表現してください
- 専門用語には必要に応じて説明を追加してください

変換対象の文章：
${freeText}`


        }
        else {
            prompt = `以下の条件に沿って${language}で「${outputFormat}」の文章を生成してください。\n\n`;

            prompt += `【文体】：${tone}\n`;
            prompt += `【希望文字数】：約${wordCount}文字\n`;
            if (freeText && freeText.trim() !== '') {
                prompt += `【キーワード・リライト対象】
                ${freeText}\n`;
            }
    
        }

        if (additionalText && additionalText.trim() !== '') {
            prompt += `【追加条件】：${additionalText}\n`;
        }
        if (audience && audience !== '指定しない') {
            prompt += `【対象読者】：${audience}\n`;
        }


        console.log('生成されたプロンプト:', prompt);

        return prompt;
    };

    /**
     * 生成AIのAPI（stream）を呼び出し、生成された文章を順次表示します。
     */
    const handleSubmit = async () => {
        // 前回の結果をクリアし、生成中フラグを設定
        setGeneratedText('');
        setIsGenerating(true);

        // ユーザーの入力情報に基づいてプロンプトを生成
        const prompt = generatePrompt();
        // console.log('生成されたプロンプト:', prompt);

        const payload = {
            text: prompt,
            systemPrompt: systemPrompts[aiRole],
            type: 'full',
            history: [],
        };

        // 生成AIのAPI（stream）を呼び出し、生成された文章を順次表示します。
        await startStreaming(payload);
    };

    /**
     * 再生成ボタン押下時の処理
     */
    const handleRegenerate = () => {
        setGeneratedText('');
        handleSubmit();
    };

    /**
     * コピー処理：生成された文章をクリップボードへコピーします
     */
    const handleCopy = async () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText)
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
                    console.error("コピーに失敗しました:", err);
                });


        }
    };

    /**
     * エディターへ反映処理：エディターとの連携が必要な場合は適宜実装してください
     */
    const handleApplyEditor = () => {
        if (onInsert) {
            onInsert(generatedText);
            toast({
                title: "エディタへ反映",
                description: "エディタへ反映しました",
                variant: "default",
            });
        }
    };

    return (
        <div className="max-w-4xl p-2 space-y-6">
            {/* 入力フォーム */}
            <Card className="bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>テキスト生成の指示</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                            テキスト生成の指示を入力してください。
                        </Label>
                        <Textarea
                            placeholder="例) マーケティング報告のテンプレートを作成してください"
                            value={freeText}
                            onChange={(e) => setFreeText(e.target.value)}
                            className="min-h-[100px] bg-background text-foreground border-input"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>オプション</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Label className="text-sm text-muted-foreground">
                            文書生成の条件を設定してください。
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* 各種Select, Input要素 */}
                            <div className="space-y-2">
                                <Label>生成AIの役割</Label>
                                <Select value={aiRole} onValueChange={setAiRole}>
                                    <SelectTrigger className="bg-background text-foreground border-input">
                                        <SelectValue placeholder="生成AIの役割を選択" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground">
                                        <SelectItem value="熟練したライター" className="hover:bg-accent hover:text-accent-foreground">熟練したライター</SelectItem>
                                        <SelectItem value="熟練編集者" className="hover:bg-accent hover:text-accent-foreground">熟練編集者</SelectItem>
                                        <SelectItem value="技術専門家" className="hover:bg-accent hover:text-accent-foreground">技術専門家</SelectItem>
                                        <SelectItem value="マーケティングスペシャリスト" className="hover:bg-accent hover:text-accent-foreground">マーケティングスペシャリスト</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 他のSelect要素も同様に修正 */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>文体</Label>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="bg-background text-foreground border-input">
                                        <SelectValue placeholder="雰囲気を選択" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground">
                                        <SelectItem value="フォーマル" className="hover:bg-accent hover:text-accent-foreground">フォーマル</SelectItem>
                                        <SelectItem value="カジュアル" className="hover:bg-accent hover:text-accent-foreground">カジュアル</SelectItem>
                                        <SelectItem value="キャッチー" className="hover:bg-accent hover:text-accent-foreground">キャッチー</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>対象読者</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="bg-background text-foreground border-input">
                                        <SelectValue placeholder="対象読者を選択" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground">
                                        <SelectItem value="指定しない" className="hover:bg-accent hover:text-accent-foreground">指定しない</SelectItem>
                                        <SelectItem value="一般" className="hover:bg-accent hover:text-accent-foreground">一般</SelectItem>
                                        <SelectItem value="専門家" className="hover:bg-accent hover:text-accent-foreground">専門家</SelectItem>
                                        <SelectItem value="子供向け" className="hover:bg-accent hover:text-accent-foreground">子供向け</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>希望文字数</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={wordCount}
                                        onChange={(e) => setWordCount(e.target.value)}
                                        className="bg-background text-foreground border-input"
                                    />
                                    <span className="whitespace-nowrap text-foreground">文字</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>言語</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="bg-background text-foreground border-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground">
                                        <SelectItem value="日本語" className="hover:bg-accent hover:text-accent-foreground">日本語</SelectItem>
                                        <SelectItem value="英語" className="hover:bg-accent hover:text-accent-foreground">英語</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>出力形式</Label>
                                <Select value={outputFormat} onValueChange={setOutputFormat}>
                                    <SelectTrigger className="bg-background text-foreground border-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground">
                                        <SelectItem value="文章" className="hover:bg-accent hover:text-accent-foreground">文章</SelectItem>
                                        <SelectItem value="報告資料" className="hover:bg-accent hover:text-accent-foreground">報告資料</SelectItem>
                                        <SelectItem value="一般記事" className="hover:bg-accent hover:text-accent-foreground">一般記事</SelectItem>
                                        <SelectItem value="ブログ記事" className="hover:bg-accent hover:text-accent-foreground">ブログ記事</SelectItem>
                                        <SelectItem value="メルマガ" className="hover:bg-accent hover:text-accent-foreground">メルマガ</SelectItem>
                                        <SelectItem value="スライド" className="hover:bg-accent hover:text-accent-foreground">スライド</SelectItem>
                                        <SelectItem value="箇条書き" className="hover:bg-accent hover:text-accent-foreground">箇条書き</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>追加条件</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label className="text-sm text-muted-foreground">
                        追加の指示があればこちらに記載してください。
                    </Label>
                    <Textarea
                        placeholder="例）です・ます調で書いてください"
                        value={additionalText}
                        onChange={(e) => setAdditionalText(e.target.value)}
                        className="min-h-[100px] bg-background text-foreground border-input"
                    />
                </CardContent>
            </Card>

            {/* 生成要求ボタン */}
            <div className="flex justify-center">
                <Button 
                    onClick={handleSubmit} 
                    className="px-8 bg-primary text-primary-foreground hover:bg-primary/90" 
                    disabled={isGenerating}
                >
                    {isGenerating ? '生成中...' : 'コンテンツを生成する'}
                </Button>
            </div>

            {generatedText && (
                <Card className="bg-card text-card-foreground">
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border">
                        <CardTitle>生成結果</CardTitle>
                        <div className="flex gap-2 mt-2 md:mt-0">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRegenerate} 
                                disabled={isGenerating}
                                className="hover:bg-accent hover:text-accent-foreground"
                            >
                                再生成
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleCopy} 
                                disabled={isGenerating}
                                className="hover:bg-accent hover:text-accent-foreground"
                            >
                                コピー
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleApplyEditor} 
                                disabled={isGenerating}
                                className="hover:bg-accent hover:text-accent-foreground"
                            >
                                エディターへ反映
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert whitespace-pre-wrap max-h-96 overflow-y-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {generatedText}
                            </ReactMarkdown>
                            {loading && (
                                <div className="flex justify-center py-2">
                                    <Sparkles className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
