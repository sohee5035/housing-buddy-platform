import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Palette } from "lucide-react";

interface ColorOption {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  ring: string;
  description: string;
}

const colorOptions: ColorOption[] = [
  {
    name: "현재 보라색",
    primary: "270 45% 60%",
    secondary: "270 20% 93%",
    accent: "270 20% 93%",
    ring: "270 45% 60%",
    description: "부드럽고 세련된 보라색"
  },
  {
    name: "진한 보라색",
    primary: "270 60% 55%",
    secondary: "270 25% 90%",
    accent: "270 25% 90%",
    ring: "270 60% 55%",
    description: "더 진하고 선명한 보라색"
  },
  {
    name: "따뜻한 보라색",
    primary: "280 50% 58%",
    secondary: "280 20% 92%",
    accent: "280 20% 92%",
    ring: "280 50% 58%",
    description: "따뜻하고 친근한 보라색"
  },
  {
    name: "차가운 보라색",
    primary: "260 55% 60%",
    secondary: "260 25% 93%",
    accent: "260 25% 93%",
    ring: "260 55% 60%",
    description: "차가우면서도 우아한 보라색"
  },
  {
    name: "핑크 보라색",
    primary: "300 45% 60%",
    secondary: "300 20% 93%",
    accent: "300 20% 93%",
    ring: "300 45% 60%",
    description: "부드럽고 로맨틱한 핑크 보라색"
  },
  {
    name: "원본 파란색",
    primary: "217 91% 60%",
    secondary: "210 40% 93%",
    accent: "210 40% 93%",
    ring: "217 91% 60%",
    description: "원래 파란색 (참고용)"
  }
];

interface ColorPaletteSelectorProps {
  onColorSelect: (color: ColorOption) => void;
}

export default function ColorPaletteSelector({ onColorSelect }: ColorPaletteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);

  const handleColorSelect = (color: ColorOption) => {
    setSelectedColor(color);
    onColorSelect(color);
    setIsOpen(false);
  };

  const getColorPreview = (color: ColorOption) => {
    const hsl = color.primary.split(' ');
    const h = parseInt(hsl[0]);
    const s = parseInt(hsl[1]);
    const l = parseInt(hsl[2]);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed top-4 right-4 z-50">
          <Palette className="h-4 w-4 mr-2" />
          색상 변경
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>색상 테마 선택</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {colorOptions.map((color, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleColorSelect(color)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: getColorPreview(color) }}
                />
                <div>
                  <div className="font-medium">{color.name}</div>
                  <div className="text-sm text-gray-500">{color.description}</div>
                </div>
              </div>
              <div className="flex space-x-1">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorPreview(color) }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: `hsl(${color.secondary})` }}
                />
              </div>
            </div>
          ))}
        </div>
        {selectedColor && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              선택됨: <strong>{selectedColor.name}</strong>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}