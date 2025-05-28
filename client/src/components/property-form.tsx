import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPropertySchema, type InsertProperty, type Property } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, X, Plus } from "lucide-react";
import ImageUpload from "./image-upload";

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Property;
}

export default function PropertyForm({ onSuccess, onCancel, initialData }: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);

  const form = useForm<InsertProperty>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      title: initialData?.title || "",
      address: initialData?.address || "",
      deposit: initialData?.deposit || 0,
      monthlyRent: initialData?.monthlyRent || 0,
      description: initialData?.description || "",
      otherInfo: initialData?.otherInfo || "",
      photos: photos,
      isActive: initialData?.isActive || 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProperty) => {
      if (initialData?.id) {
        // Update existing property
        const response = await apiRequest("PUT", `/api/properties/${initialData.id}`, data);
        return response.json();
      } else {
        // Create new property
        const response = await apiRequest("POST", "/api/properties", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: initialData?.id ? "수정 완료" : "등록 완료",
        description: initialData?.id ? "매물이 성공적으로 수정되었습니다." : "매물이 성공적으로 등록되었습니다.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProperty) => {
    const propertyData = {
      ...data,
      photos,
    };
    createMutation.mutate(propertyData);
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    form.setValue("photos", newPhotos);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Create New Listing</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>매물 제목 *</FormLabel>
                <FormControl>
                  <Input placeholder="매물 제목을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주소 *</FormLabel>
                <FormControl>
                  <Input placeholder="전체 주소를 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보증금 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-neutral-500">₩</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>월세 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-neutral-500">₩</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenanceFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>관리비</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-neutral-500">₩</span>
                        <Input
                          type="number"
                          placeholder="관리비 입력"
                          className="pl-8"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value) : null);
                          }}
                        />
                      </div>
                      <div className="text-xs text-neutral-500">
                        비워두면 "알 수 없음"으로 표시됩니다
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>카테고리 *</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value || "기타"} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="원룸">원룸</SelectItem>
                      <SelectItem value="투룸">투룸</SelectItem>
                      <SelectItem value="쓰리룸">쓰리룸</SelectItem>
                      <SelectItem value="오피스텔">오피스텔</SelectItem>
                      <SelectItem value="아파트">아파트</SelectItem>
                      <SelectItem value="빌라">빌라</SelectItem>
                      <SelectItem value="상가">상가</SelectItem>
                      <SelectItem value="사무실">사무실</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>원본 페이지 링크 (선택)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="원본 매물 페이지 URL을 입력하세요" 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기타 정보 (선택)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="추가 정보를 입력하세요 (예: 주차 가능, 엘리베이터 등)" 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 설명 *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="매물에 대한 상세한 설명을 입력하세요..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              매물 사진 (최대 5장)
            </label>
            <ImageUpload
              maxImages={5}
              onImagesChange={handlePhotosChange}
              initialImages={photos}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
