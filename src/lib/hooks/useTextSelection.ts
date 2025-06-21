// src/lib/hooks/useTextSelection.ts
import { BlockNoteEditor, BlockNoteSchema } from "@blocknote/core";
import { useState, useCallback, useRef, useEffect } from "react";
import { normalizeText } from "../utils/text-processing";
import { MENU_WIDTH } from "@/components/editor/TextSelectionMenu";

export const useTextSelection = () => {
  const [selection, setSelection] = useState<string | null>(null);
  const [selectionMenuPosition, setSelectionMenuPosition] = useState({ x: 0, y: 0, height: 0 });
  const isMouseDownRef = useRef(false);

  const handleMouseDown = useCallback(() => {
    isMouseDownRef.current = true;
  }, []);


  const handleSelectionChange = useCallback(() => {
    if (isMouseDownRef.current) {
      return;
    }

    // アクティブな要素がInput要素の場合は選択をクリアしない
    if (document.activeElement instanceof HTMLInputElement) {
      return;
    }

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      if (range) {
        // 選択範囲の ClientRects を取得
        const rects = range.getClientRects();
        // 最後の要素の位置を取得（右から左への選択にも対応）
        const lastRect = rects[selection.focusNode === range.endContainer ? rects.length - 1 : 0];

        if (lastRect) {
          // setSelectionMenuPosition({
          //   x: lastRect.right, // 最後の文字の右端
          //   y: lastRect.top,
          //   height: lastRect.height
          // });

          // 画面の右端を超えるかチェック
          const exceedsRight = lastRect.right + MENU_WIDTH > window.innerWidth;

          setSelectionMenuPosition({
            // 画面右端を超える場合は左側に表示
            x: exceedsRight ? lastRect.left : lastRect.right,
            y: lastRect.top,
            height: lastRect.height
          });
        }

        const selectedText = selection.toString();
        if (selectedText) {
          setSelection(normalizeText(selectedText));
        }
      }
    } else {
      setSelection(null);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
    // マウスボタンが離された後に選択状態を確認
    handleSelectionChange();
  }, [handleSelectionChange]);


  // const handleTextSelection = useCallback(async (editor: BlockNoteEditor<any> | null) => {
  //   if (editor) {
  //     const selection = editor.getSelection();
  //     // マウスボタンが押されている間は選択範囲の更新のみ行う
  //     if (selection && isMouseDownRef.current) {
  //       const range = window.getSelection()?.getRangeAt(0);
  //       if (range) {
  //         const rect = range.getBoundingClientRect();
  //         setSelectionMenuPosition({
  //           x: rect.left,
  //           y: rect.top,
  //           height: rect.height
  //         });
  //       }
  //     } else if (!selection) {
  //       setSelection(null);
  //     }
  //   } else {
  //     setSelection(null);
  //   }
  // }, []);

  const handleTextSelection = useCallback(async (editor: BlockNoteEditor<any> | null) => {
    // アクティブな要素がInput要素かどうかをチェック
    const isInputActive = document.activeElement instanceof HTMLInputElement;

    if (editor) {
      const selection = editor.getSelection();
      // マウスボタンが押されている間は選択範囲の更新のみ行う
      if (selection && isMouseDownRef.current) {
        const range = window.getSelection()?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setSelectionMenuPosition({
            x: rect.left,
            y: rect.top,
            height: rect.height
          });
        }
      } else if (!selection && !isInputActive) { // Input要素がフォーカスされていない場合のみ選択をクリア
        setSelection(null);
      }
    } else if (!isInputActive) { // Input要素がフォーカスされていない場合のみ選択をクリア
      setSelection(null);
    }
  }, []);

  // コンポーネントのマウントとアンマウント時にイベントリスナーを設定
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleMouseDown, handleMouseUp, handleSelectionChange]);

  return {
    selection,
    selectionMenuPosition,
    handleTextSelection
  };
};