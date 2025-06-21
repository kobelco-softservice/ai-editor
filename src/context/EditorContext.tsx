// src/context/EditorContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Block, BlockNoteEditor, BlockNoteSchema, BlockSchemaFromSpecs, DefaultBlockSchema, defaultBlockSpecs, PartialBlock } from '@blocknote/core';
import { arch } from 'os';
import { normalize } from 'path';
import { normalizeText } from '@/lib/utils/text-processing';
import { HorizontalLineBlock } from '@/lib/custom-block';
import { Selection as EditorSelection } from '@blocknote/core';

interface UpdateParams {
    mode: 'replace' | 'insertAbove' | 'insertBelow';
    content: string;
    selectedText: string | null;
}

interface EditorContextType {
    content: string;
    editor: BlockNoteEditor | null;
    selection: EditorSelection<any, any, any> | null;
    setSelection: (selection: EditorSelection<any, any, any> | null) => void;
    setEditor: (editor: BlockNoteEditor | null) => void;
    setEditorContent: (content: string) => void;
    updateBlockNoteContent: (params: UpdateParams) => void;
    selectedText: string | null;
    setSelectedText: (text: string | null) => void;
    nowBlock: Block<BlockSchemaFromSpecs<any>> | null;
}

export const blockSchema = BlockNoteSchema.create({
    blockSpecs: {
        // Adds all default blocks.
        ...defaultBlockSpecs,
        // Adds the Alert block.
        horizontal_line: HorizontalLineBlock,
    },
});


const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [content, setContent] = useState('');
    const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
    const [selection, setSelection] = useState<EditorSelection<any, any, any> | null>(null);
    const [selectedText, setSelectedText] = useState<string | null>(null);

    const [nowBlock, setNowBlock] = useState<Block<BlockSchemaFromSpecs<any>> | null>(null);

    useEffect(() => {
        if (!editor) return;

        const handleSelectionChange = () => {

            // カーソル位置のブロックを取得
            const textCursorPosition = editor.getTextCursorPosition();
            setNowBlock(textCursorPosition.block);
            // console.log('現在のブロック:', textCursorPosition.block);

            // 選択範囲を取得
            const selection = editor.getSelection();
            if (selection) {
                setSelection(selection);
                const text = editor.getSelectedText();
                setSelectedText(text ? normalizeText(text) : null);
            } else {
                setSelection(null);
                setSelectedText(null);
            }
        };

        // エディタの選択変更イベントをリッスン
        const unsubscribe = editor.onSelectionChange(handleSelectionChange);

        return () => {
            // クリーンアップ
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [editor]);


    // const updateBlockNoteContent = async ({ mode, content: aiResult, selectedText }: UpdateParams) => {
    const updateBlockNoteContent = async ({ mode, content: aiResult, selectedText }: UpdateParams) => {
        if (!editor) return;


        // const selection = editor.getSelection();
        switch (mode) {
            case 'replace':
                // 選択テキストを新しい内容で置換
                // const newBlocks = await editor.tryParseMarkdownToBlocks(aiResult);
                // const newContent = newBlocks[0].content;

                // console.log('newContent:', newContent);
                // console.log('selectedText:', selectedText);

                // const replaceContent = newContent.replace(selectedText, '');

                // // 選択範囲のテキストを置換
                // editor.insertContent(newBlocks[0].content, range);
                // // ブロックの更新
                // editor.updateBlock(block, { content: newContent });
                // editor.replaceBlocks(selection.blocks, newBlocks);
                try {

                    if (!selection || !selectedText) return;

                    // 選択範囲のブロックを取得
                    const [startBlock, endBlock] = selection.blocks;
            
                    // 選択されているブロックを取得
                    const selectedBlocks = selection.blocks;
            
            
                    // 選択中のブロックの文字列をすべて取得
                    const blocks = selectedBlocks.map(id => editor.getBlock(id)).filter(Boolean);
                    const blockTexts = blocks.map(block => ({
                        block,
                        text: Array.isArray(block!.content)
                            ? block!.content
                                .filter((item: any) => item.type === 'text')
                                .map((item: any) => item.text)
                                .join('')
                            : ''
                    }));

                    // ブロックのテキスト
                    const allText = normalizeText(blockTexts.map(item => item.text).join(''));

                    // リプレース後のテキスト
                    const replacedTexts = allText.replace(selectedText, aiResult);

                    //ブロックを削除
                    for (let i = 0; i < blocks.length - 1; i++) {
                        editor.removeBlocks([blocks[i]!.id]);
                    }

                    //新しいブロック
                    const newBlocks = await editor.tryParseMarkdownToBlocks(replacedTexts);

                    //最後のブロックを置換
                    if (blocks.length > 0 && blocks[blocks.length - 1]) {
                        editor.replaceBlocks([blocks[blocks.length - 1]!.id], newBlocks);
                    }

                } catch (error) {
                    console.error('エラーが発生しました:', error);
                }


                break;

            case 'insertAbove': {
                try {

                    if (nowBlock === null) return;

                    // const topBlock = selectedBlocks[0];
                    const newBlocks = await editor.tryParseMarkdownToBlocks(aiResult);
                    try {
                        editor.insertBlocks(newBlocks, nowBlock, 'before');
                    } catch (error) {
                        const textCursorPosition = editor.getTextCursorPosition();
                        editor.insertBlocks(newBlocks,textCursorPosition.block, 'before');
                    }


                    // // リプレース後のテキスト
                    // const afterText = mode === 'insertAbove' 
                    //     ? aiResult + selectedText 
                    //     : selectedText + aiResult;

                    // const replacedTexts = allText.replace(selectedText, afterText);

                    // //ブロックを削除
                    // for (let i = 0; i < blocks.length - 1; i++) {
                    //     editor.removeBlocks([blocks[i]!.id]);
                    // }
                    // //新しいブロック
                    // const newBlocks = await editor.tryParseMarkdownToBlocks(replacedTexts);

                    // //最後のブロックを置換
                    // if (blocks.length > 0) {
                    //     editor.replaceBlocks([blocks[blocks.length - 1].id], newBlocks);
                    // }

                } catch (error) {
                    // console.error('Error inserting blocks:', error);
                }
                break;
            }
            case 'insertBelow': {
                try {

                    // console.log('nowBlock:', nowBlock);
                    if (nowBlock === null) return;

                    // const lastBlock = selectedBlocks[selectedBlocks.length - 1];
                    const newBlocks = await editor.tryParseMarkdownToBlocks(aiResult);

                    try {
                        editor.insertBlocks(newBlocks, nowBlock, 'after');
                    } catch (error) {
                        const textCursorPosition = editor.getTextCursorPosition();
                        editor.insertBlocks(newBlocks,textCursorPosition.block, 'after');
                    }

                    // // リプレース後のテキスト
                    // const afterText = mode === 'insertAbove' 
                    //     ? aiResult + selectedText 
                    //     : selectedText + aiResult;

                    // const replacedTexts = allText.replace(selectedText, afterText);

                    // //ブロックを削除
                    // for (let i = 0; i < blocks.length - 1; i++) {
                    //     editor.removeBlocks([blocks[i]!.id]);
                    // }
                    // //新しいブロック
                    // const newBlocks = await editor.tryParseMarkdownToBlocks(replacedTexts);

                    // //最後のブロックを置換
                    // if (blocks.length > 0) {
                    //     editor.replaceBlocks([blocks[blocks.length - 1].id], newBlocks);
                    // }

                } catch (error) {
                    // console.error('Error inserting blocks:', error);
                }
                break;
            }
        }
    };

    return (
        <EditorContext.Provider
            value={{
                content,
                editor,
                setSelection,
                selection,
                setEditor,
                setEditorContent: setContent,
                updateBlockNoteContent,
                selectedText,
                setSelectedText,
                nowBlock
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = (): EditorContextType => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};