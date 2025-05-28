import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TranslationContextType {
  translatedData: Record<string, string>;
  isTranslated: boolean;
  targetLanguage: string;
  setTranslatedData: (data: Record<string, string>) => void;
  setIsTranslated: (translated: boolean) => void;
  setTargetLanguage: (language: string) => void;
  getTranslatedText: (originalText: string, key?: string) => string;
  clearTranslations: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translatedData, setTranslatedData] = useState<Record<string, string>>({});
  const [isTranslated, setIsTranslated] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');

  const getTranslatedText = (originalText: string, key?: string) => {
    if (!isTranslated || !originalText) return originalText;
    
    const lookupKey = key || originalText;
    return translatedData[lookupKey] || originalText;
  };

  const clearTranslations = () => {
    setTranslatedData({});
    setIsTranslated(false);
  };

  return (
    <TranslationContext.Provider value={{
      translatedData,
      isTranslated,
      targetLanguage,
      setTranslatedData,
      setIsTranslated,
      setTargetLanguage,
      getTranslatedText,
      clearTranslations
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}