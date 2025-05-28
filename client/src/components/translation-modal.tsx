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
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어 (Korean)", flag: "🇰🇷" },
  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵" },
  { code: "zh", name: "中文 (Chinese)", flag: "🇨🇳" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷" },
];

export default function TranslationModal({ isOpen, onClose, property }: TranslationModalProps) {
  const [targetLanguage, setTargetLanguage] = useState("ko");
  const [translatedText, setTranslatedText] = useState("");
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: async ({ text, targetLang }: { text: string; targetLang: string }) => {
      return translateText(text, targetLang);
    },
    onSuccess: (data) => {
      setTranslatedText(data.translatedText);
    },
    onError: () => {
      toast({
        title: "Translation Failed",
        description: "Unable to translate the text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTranslate = () => {
    if (!property?.description) return;
    
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
