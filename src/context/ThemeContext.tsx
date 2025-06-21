// 'use client'
// import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// interface ThemeContextProps {
//   theme: 'light' | 'dark';
//   toggleTheme: () => void;
// }

// const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [theme, setTheme] = useState<'light' | 'dark'>('light');

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
//   };

//   // document.bodyの代わりにhtmlタグにクラスを適用
//   useEffect(() => {
//     const root = document.documentElement;
//     root.classList.remove('light', 'dark');
//     root.classList.add(theme);
//   }, [theme]);

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };