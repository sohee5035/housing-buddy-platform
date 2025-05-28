import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tags, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: string[];
  onUpdateCategories: (categories: string[]) => void;
  propertyCategories: string[]; // 매물에서 실제 사용 중인 카테고리들
}

export default function CategoryManager({ 
  isOpen, 
  onClose, 
  customCategories, 
  onUpdateCategories,
  propertyCategories 
}: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  // 모든 카테고리 목록 (매물에서 사용 중인 것 + 커스텀)
  const allCategories = Array.from(new Set([...propertyCategories, ...customCategories]));

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !allCategories.includes(newCategoryName.trim())) {
      const updatedCategories = [...customCategories, newCategoryName.trim()];
      onUpdateCategories(updatedCategories);
      setNewCategoryName("");
      toast({
        title: "카테고리 추가 완료",
        description: `'${newCategoryName.trim()}' 카테고리가 추가되었습니다.`,
      });
    } else if (allCategories.includes(newCategoryName.trim())) {
      toast({
        title: "중복된 카테고리",
        description: "이미 존재하는 카테고리입니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editingCategory && !allCategories.includes(editValue.trim())) {
      const updatedCategories = customCategories.map(cat => 
        cat === editingCategory ? editValue.trim() : cat
      );
      onUpdateCategories(updatedCategories);
      setEditingCategory(null);
      setEditValue("");
      toast({
        title: "카테고리 수정 완료",
        description: `카테고리가 '${editValue.trim()}'로 변경되었습니다.`,
      });
    } else if (allCategories.includes(editValue.trim())) {
      toast({
        title: "중복된 카테고리",
        description: "이미 존재하는 카테고리명입니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = (category: string) => {
    // 매물에서 사용 중인 카테고리는 삭제 불가
    if (propertyCategories.includes(category)) {
      toast({
        title: "삭제 불가",
        description: "해당 카테고리를 사용하는 매물이 있어서 삭제할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = customCategories.filter(cat => cat !== category);
    onUpdateCategories(updatedCategories);
    toast({
      title: "카테고리 삭제 완료",
      description: `'${category}' 카테고리가 삭제되었습니다.`,
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            카테고리 관리
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 새 카테고리 추가 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">새 카테고리 추가</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="카테고리명을 입력하세요"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 기존 카테고리 목록 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">기존 카테고리</h3>
              
              {allCategories.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">등록된 카테고리가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {allCategories.map((category) => {
                    const isUsedInProperties = propertyCategories.includes(category);
                    const isCustom = customCategories.includes(category);
                    const isEditing = editingCategory === category;

                    return (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                              className="w-40"
                              autoFocus
                            />
                          ) : (
                            <>
                              <span className="font-medium">{category}</span>
                              <div className="flex gap-1">
                                {isUsedInProperties && (
                                  <Badge variant="secondary" className="text-xs">
                                    사용중
                                  </Badge>
                                )}
                                {isCustom && (
                                  <Badge variant="outline" className="text-xs">
                                    커스텀
                                  </Badge>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {isCustom && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                              {isCustom && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteCategory(category)}
                                  disabled={isUsedInProperties}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 안내 메시지 */}
          <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded">
            <p>• <strong>사용중</strong> 표시된 카테고리는 매물에서 사용 중입니다.</p>
            <p>• <strong>커스텀</strong> 표시된 카테고리는 사용자가 추가한 카테고리입니다.</p>
            <p>• 매물에서 사용 중인 카테고리는 삭제할 수 없습니다.</p>
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}