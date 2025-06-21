import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { EditorSettingsProvider } from "../context/EditorSettingsContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Editor",
  description: "AI-powered text editor for enhanced writing experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <EditorSettingsProvider>
            {children}
          </EditorSettingsProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}