// import { BlockNoteEditor } from "@blocknote/core";
// import { useCallback, useState, useEffect } from "react";
// import { normalizeText } from "@/lib/utils/text-processing";
// import { Selection as EditorSelection  } from '@blocknote/core';

// export const useEditorSelection = (editor: BlockNoteEditor | null) => {
//     const [selectedText, setSelectedText] = useState<string | null>(null);
//     const [selection, setSelection] = useState<EditorSelection<any,any,any> | null>(null);

//     useEffect(() => {
//         if (!editor) return;

//         const handleSelectionChange = () => {
//             const selection = editor.getSelection();
//             if (selection) {
//                 setSelection(selection);

//                 const text = editor.getSelectedText();
//                 setSelectedText(text ? normalizeText(text) : null);
//             } else {
//                 setSelection(null);
//                 setSelectedText(null);
//             }
//         };

//         // エディタの選択変更イベントをリッスン
//         const unsubscribe = editor.onSelectionChange(handleSelectionChange);

//         return () => {
//             // クリーンアップ
//             if (typeof unsubscribe === 'function') {
//                 unsubscribe();
//             }
//         };
//     }, [editor]);

//     return {
//         selection,
//         selectedText,
//         setSelectedText
//     };
// };