import { apiRequest } from "./queryClient";

export interface TranslationResponse {
  translatedText: string;
}

export async function translateText(text: string, targetLang: string): Promise<TranslationResponse> {
  const response = await apiRequest("POST", "/api/translate", {
    text,
    targetLang,
  });
  
  return response.json();
}

export const supportedLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어 (Korean)", flag: "🇰🇷" },
  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵" },
  { code: "zh", name: "中文 (Chinese)", flag: "🇨🇳" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷" },
];
