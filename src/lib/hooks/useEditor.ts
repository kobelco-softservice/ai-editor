// src/lib/hooks/useEditor.ts
import { useState, useCallback, useEffect } from 'react';

// エディタの状態を管理するフック
export const useEditor = () => {
  const [content, setContent] = useState('');
  const [isModified, setIsModified] = useState(false);

  const handleChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  // 自動保存の実装
  useEffect(() => {
    if (isModified) {
      const saveTimeout = setTimeout(() => {
        // ここで保存処理を実装
        console.log('Content saved:', content);
        setIsModified(false);
      }, 2000);

      return () => clearTimeout(saveTimeout);
    }
  }, [content, isModified]);

  return {
    content,
    isModified,
    handleChange
  };
};

// // テキスト選択を管理するフック
// export const useTextSelection = () => {
//   const [selection, setSelection] = useState<string | null>(null);
//   const [position, setPosition] = useState({ x: 0, y: 0 });

//   const handleTextSelection = useCallback((event: MouseEvent) => {
//     const selectedText = window.getSelection()?.toString() || '';
    
//     if (selectedText.length > 0) {
//       const range = window.getSelection()?.getRangeAt(0);
//       if (range) {
//         const rect = range.getBoundingClientRect();
//         setPosition({
//           x: rect.left + window.scrollX,
//           y: rect.bottom + window.scrollY
//         });
//         setSelection(selectedText);
//       }
//     } else {
//       setSelection(null);
//     }
//   }, []);

//   useEffect(() => {
//     document.addEventListener('mouseup', handleTextSelection);
//     return () => {
//       document.removeEventListener('mouseup', handleTextSelection);
//     };
//   }, [handleTextSelection]);

//   return {
//     selection,
//     position,
//     clearSelection: () => setSelection(null)
//   };
// };