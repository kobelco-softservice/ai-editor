// src/context/OutlineContext.tsx
import { createContext, useContext, useState } from 'react';
import type { Block } from '@blocknote/core';

interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children?: OutlineItem[];
  expanded?: boolean;
}

interface OutlineContextType {
  outline: OutlineItem[];
  updateOutlineFromBlocks: (blocks: Block[]) => void;
  updateOutlineStructure: (items: OutlineItem[]) => void;
}

const OutlineContext = createContext<OutlineContextType>({
  outline: [],
  updateOutlineFromBlocks: () => {},
  updateOutlineStructure: () => {}
});

export const OutlineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  const updateOutlineFromBlocks = (blocks: Block[]) => {
    const outlineItems: OutlineItem[] = [];
    let stack: OutlineItem[] = [];

    blocks.forEach((block, index) => {
      if (block.type === 'heading') {
        const level = block.props?.level || 1;
        const title = block.content?.[0]?.type || '';
        
        const item: OutlineItem = {
          id: `heading-${index}`,
          title,
          level,
          children: [],
          expanded: true
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          outlineItems.push(item);
        } else {
          const parent = stack[stack.length - 1];
          if (!parent.children) parent.children = [];
          parent.children.push(item);
        }

        stack.push(item);
      }
    });

    setOutline(outlineItems);
  };

  const updateOutlineStructure = (items: OutlineItem[]) => {
    setOutline(items);
  };

  return (
    <OutlineContext.Provider value={{ 
      outline, 
      updateOutlineFromBlocks, 
      updateOutlineStructure 
    }}>
      {children}
    </OutlineContext.Provider>
  );
};

export const useOutline = () => useContext(OutlineContext);