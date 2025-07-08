import { apiRequest } from "./queryClient";

export interface TranslationResponse {
  translatedText: string;
}

export async function translateText(text: string, targetLang: string): Promise<TranslationResponse> {
  const response = await apiRequest("POST", "/api/translate", {
    text,
    targetLang,
  });
  
  const data = await response.json();
  console.log("Translation response:", data); // 디버깅용
  return data;
}

export const supportedLanguages = [
  { code: "ko", name: "한국어 (Korean)", flag: "🇰🇷" },
  { code: "en", name: "English (영어)", flag: "🇺🇸" },
  { code: "ja", name: "日本語 (일본어)", flag: "🇯🇵" },
  { code: "zh", name: "中文 (중국어)", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文 (번체중국어)", flag: "🇹🇼" },
  { code: "es", name: "Español (스페인어)", flag: "🇪🇸" },
  { code: "fr", name: "Français (프랑스어)", flag: "🇫🇷" },
  { code: "de", name: "Deutsch (독일어)", flag: "🇩🇪" },
  { code: "it", name: "Italiano (이탈리아어)", flag: "🇮🇹" },
  { code: "pt", name: "Português (포르투갈어)", flag: "🇵🇹" },
  { code: "ru", name: "Русский (러시아어)", flag: "🇷🇺" },
  { code: "ar", name: "العربية (아랍어)", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी (힌디어)", flag: "🇮🇳" },
  { code: "th", name: "ไทย (태국어)", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt (베트남어)", flag: "🇻🇳" },
  { code: "nl", name: "Nederlands (네덜란드어)", flag: "🇳🇱" },
  { code: "sv", name: "Svenska (스웨덴어)", flag: "🇸🇪" },
  { code: "da", name: "Dansk (덴마크어)", flag: "🇩🇰" },
  { code: "no", name: "Norsk (노르웨이어)", flag: "🇳🇴" },
  { code: "fi", name: "Suomi (핀란드어)", flag: "🇫🇮" },
  { code: "pl", name: "Polski (폴란드어)", flag: "🇵🇱" }
];
