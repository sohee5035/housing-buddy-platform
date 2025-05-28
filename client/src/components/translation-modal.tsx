import { useState } from "react";
import { Property } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { translateText } from "@/lib/translate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Languages, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

const languages = [
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

export default function TranslationModal({ isOpen, onClose, property }: TranslationModalProps) {
  const [targetLanguage, setTargetLanguage] = useState("ko");
  const [translatedText, setTranslatedText] = useState("");
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: async ({ text, targetLang }: { text: string; targetLang: string }) => {
      console.log("Translation mutation called with:", { text, targetLang });
      const result = await translateText(text, targetLang);
      console.log("Translation mutation result:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Translation success, data:", data);
      setTranslatedText(data.translatedText);
      console.log("Translation text set to:", data.translatedText);
    },
    onError: (error) => {
      console.log("Translation error:", error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate the text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTranslate = () => {
    console.log("=== TRANSLATE BUTTON CLICKED ===");
    console.log("Property:", property);
    console.log("Target language:", targetLanguage);
    
    if (!property?.description) {
      console.log("No property description found!");
      return;
    }
    
    console.log("About to call translateMutation.mutate");
    translateMutation.mutate({
      text: property.description,
      targetLang: targetLanguage,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTranslatedText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Languages className="h-5 w-5 mr-2" />
            Property Translation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Target Language
            </label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center">
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-2">
              Original Description (English)
            </h4>
            <Card>
              <CardContent className="p-4">
                <p className="text-neutral-600">
                  {property?.description || "No description available"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-2">
              Translated Description
            </h4>
            <Card>
              <CardContent className="p-4 min-h-[120px]">
                {translateMutation.isPending ? (
                  <div className="flex items-center justify-center h-20 text-neutral-400">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Translating...
                  </div>
                ) : translatedText ? (
                  <div className="space-y-3">
                    <p className="text-neutral-700">{translatedText}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Translation
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 text-neutral-400">
                    <p>Click "Translate" to see the translation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={handleTranslate}
              disabled={translateMutation.isPending || !property?.description}
            >
              {translateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
