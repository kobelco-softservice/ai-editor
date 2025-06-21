'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorSettingsContextProps {
  theme: string;
  setTheme: (theme: string) => void;
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  autoSave: boolean;
  setAutoSave: (autoSave: boolean) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (showLineNumbers: boolean) => void;
  indentType: string;
  setIndentType: (indentType: string) => void;
  indentWidth: number;
  setIndentWidth: (indentWidth: number) => void;
}

const EditorSettingsContext = createContext<EditorSettingsContextProps | undefined>(undefined);

export const EditorSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(14);
  const [autoSave, setAutoSave] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [indentType, setIndentType] = useState('spaces');
  const [indentWidth, setIndentWidth] = useState(2);

  return (
    <EditorSettingsContext.Provider value={{
      theme, setTheme,
      fontFamily, setFontFamily,
      fontSize, setFontSize,
      autoSave, setAutoSave,
      showLineNumbers, setShowLineNumbers,
      indentType, setIndentType,
      indentWidth, setIndentWidth
    }}>
      {children}
    </EditorSettingsContext.Provider>
  );
};

export const useEditorSettings = () => {
  const context = useContext(EditorSettingsContext);
  if (!context) {
    throw new Error('useEditorSettings must be used within an EditorSettingsProvider');
  }
  return context;
};