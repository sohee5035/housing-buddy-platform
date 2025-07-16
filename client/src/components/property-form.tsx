import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertPropertySchema, type InsertProperty, type Property, type University } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Plus, MapPin, Clock } from "lucide-react";
import ImageUpload from "./image-upload";

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Property;
  availableCategories?: string[];
}

export default function PropertyForm({ onSuccess, onCancel, initialData, availableCategories = [] }: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);
  const [recommendedUniversities, setRecommendedUniversities] = useState<{ id: number; distance: number }[]>([]);
  
  console.log('PropertyForm received categories:', availableCategories);

  // Fetch universities
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ["/api/universities"],
    queryFn: async () => {
      const response = await fetch("/api/universities");
      if (!response.ok) throw new Error('Failed to fetch universities');
      return response.json();
    },
  });

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
      category: initialData?.category || "기타",
      maintenanceFee: initialData?.maintenanceFee || 0,
      originalUrl: initialData?.originalUrl || "",
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
        title: initialData ? "매물 수정 완료" : "매물 등록 완료",
        description: initialData ? "매물이 성공적으로 수정되었습니다." : "새 매물이 성공적으로 등록되었습니다.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "오류 발생",
        description: error.message || "매물 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProperty) => {
    const formData = { 
      ...data, 
      photos,
      // 선택된 대학교 정보도 포함
      selectedUniversities: selectedUniversities.map(id => ({
        universityId: id,
        isRecommended: recommendedUniversities.some(rec => rec.id === id),
        distanceKm: recommendedUniversities.find(rec => rec.id === id)?.distance
      }))
    };
    createMutation.mutate(formData);
  };

  // 주소 기반 대학교 추천 (간단한 더미 로직)
  const handleAddressChange = (address: string) => {
    if (address.length > 5) {
      // 실제로는 Google Geocoding API 등을 사용해서 거리 계산
      // 여기서는 간단한 키워드 매칭으로 구현
      const recommendations: { id: number; distance: number }[] = [];
      
      universities.forEach(uni => {
        if (address.includes(uni.location) || address.includes(uni.name.slice(0, 2))) {
          recommendations.push({ id: uni.id, distance: Math.random() * 3 + 0.5 }); // 0.5-3.5km 랜덤
        }
      });
      
      setRecommendedUniversities(recommendations);
      // 추천된 대학교는 자동으로 선택
      setSelectedUniversities(prev => {
        const newIds = recommendations.map(r => r.id);
        return [...new Set([...prev, ...newIds])];
      });
    }
  };

  const handleUniversityToggle = (universityId: number) => {
    setSelectedUniversities(prev => 
      prev.includes(universityId) 
        ? prev.filter(id => id !== universityId)
        : [...prev, universityId]
    );
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
  };

  return (
    <div className="space-y-6" data-property-form>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Input 
                      placeholder="주소를 입력하세요" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleAddressChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                      <SelectItem value="기타">기타</SelectItem>
                      {availableCategories
                        .filter(cat => cat !== '전체' && cat !== '기타')
                        .map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
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

          {/* University Selection Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                주변 대학교 선택
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                매물 위치에서 가까운 대학교를 선택하세요. 주소 입력 시 추천 대학교가 자동으로 표시됩니다.
              </p>
            </CardHeader>
            <CardContent>
              {recommendedUniversities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    추천 대학교 (자동 선택됨)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendedUniversities.map(rec => {
                      const university = universities.find(u => u.id === rec.id);
                      return university ? (
                        <Badge key={university.id} variant="secondary" className="bg-green-50 text-green-700">
                          {university.icon} {university.name} ({rec.distance.toFixed(1)}km)
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {universities.map(university => (
                  <div key={university.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox 
                      id={`university-${university.id}`}
                      checked={selectedUniversities.includes(university.id)}
                      onCheckedChange={() => handleUniversityToggle(university.id)}
                    />
                    <label 
                      htmlFor={`university-${university.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <span className="text-lg">{university.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{university.name}</div>
                        <div className="text-xs text-muted-foreground">{university.location}</div>
                        {recommendedUniversities.find(r => r.id === university.id) && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                            추천
                          </Badge>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
              매물 사진
            </label>
            <ImageUpload 
              maxImages={10}
              onImagesChange={handlePhotosChange}
              initialImages={photos}
            />
          </div>

          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
            )}
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "수정" : "등록"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}