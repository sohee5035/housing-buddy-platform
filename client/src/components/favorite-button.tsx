import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { apiRequest } from "@/lib/queryClient";

interface FavoriteButtonProps {
  propertyId: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export default function FavoriteButton({ 
  propertyId, 
  size = "md", 
  variant = "ghost" 
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { getTranslatedText } = useTranslation();
  const queryClient = useQueryClient();

  // Check if property is favorite
  const { data: favoriteStatus, isLoading } = useQuery({
    queryKey: [`/api/favorites/${propertyId}/status`],
    enabled: !!isAuthenticated,
    retry: false,
  });

  const isFavorite = favoriteStatus?.isFavorite || false;

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/favorites/${propertyId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${propertyId}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: getTranslatedText("관심 매물 추가", "favorite-added-title"),
        description: getTranslatedText("관심 매물에 추가되었습니다.", "favorite-added-desc"),
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("Property already in favorites")) {
        toast({
          title: getTranslatedText("이미 추가됨", "already-favorite-title"),
          description: getTranslatedText("이미 관심 매물에 추가된 매물입니다.", "already-favorite-desc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: getTranslatedText("오류", "error-title"),
          description: getTranslatedText("관심 매물 추가에 실패했습니다.", "favorite-add-error"),
          variant: "destructive",
        });
      }
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/favorites/${propertyId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${propertyId}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: getTranslatedText("관심 매물 제거", "favorite-removed-title"),
        description: getTranslatedText("관심 매물에서 제거되었습니다.", "favorite-removed-desc"),
      });
    },
    onError: () => {
      toast({
        title: getTranslatedText("오류", "error-title"),
        description: getTranslatedText("관심 매물 제거에 실패했습니다.", "favorite-remove-error"),
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: getTranslatedText("로그인 필요", "login-required-title"),
        description: getTranslatedText("관심 매물 기능을 사용하려면 로그인해주세요.", "login-required-desc"),
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "sm" as const;
      case "lg":
        return "lg" as const;
      default:
        return "default" as const;
    }
  };

  const isPending = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;

  return (
    <Button
      variant={variant}
      size={getButtonSize()}
      onClick={handleClick}
      disabled={isPending || isLoading}
      className={`transition-colors ${
        isFavorite 
          ? "text-red-500 hover:text-red-600" 
          : "text-neutral-400 hover:text-red-500"
      }`}
      title={
        isAuthenticated 
          ? isFavorite 
            ? getTranslatedText("관심 매물에서 제거", "remove-from-favorites")
            : getTranslatedText("관심 매물에 추가", "add-to-favorites")
          : getTranslatedText("로그인이 필요합니다", "login-required")
      }
    >
      <Heart 
        className={`${getSizeClasses()} transition-all ${
          isFavorite ? "fill-current" : ""
        } ${isPending ? "animate-pulse" : ""}`} 
      />
    </Button>
  );
}