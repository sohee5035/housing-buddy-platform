import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Languages, Bed, Bath, Square, MapPin } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  onTranslate: () => void;
  viewMode?: "grid" | "list";
}

export default function PropertyCard({ property, onTranslate, viewMode = "grid" }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number, listingType: string) => {
    return listingType === "rent" 
      ? `$${price.toLocaleString()}/mo`
      : `$${price.toLocaleString()}`;
  };

  const getPropertyTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      apartment: "🏢",
      house: "🏠",
      condo: "🏘️",
      villa: "🏖️",
      townhouse: "🏘️"
    };
    return icons[type] || "🏠";
  };

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-80 h-64 md:h-48">
            <Link href={`/property/${property.id}`}>
              <img
                src={property.photos[0] || "/placeholder-property.jpg"}
                alt={property.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </Link>
            
            <div className="absolute top-4 left-4">
              <Badge variant={property.listingType === "sale" ? "default" : "secondary"}>
                For {property.listingType === "sale" ? "Sale" : "Rent"}
              </Badge>
            </div>
            
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                size="icon"
                className="bg-white/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorite(!isFavorite);
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
          
          <CardContent className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getPropertyTypeIcon(property.propertyType)}</span>
                  <Link href={`/property/${property.id}`}>
                    <h3 className="text-xl font-semibold text-neutral-900 hover:text-primary transition-colors cursor-pointer">
                      {property.title}
                    </h3>
                  </Link>
                </div>
                
                <div className="flex items-center text-sm text-neutral-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}</span>
                </div>
                
                <p className="text-neutral-600 mb-4 line-clamp-2">{property.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms || 0} bed{property.bedrooms !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms || 0} bath{property.bathrooms !== 1 ? 's' : ''}
                  </span>
                  {property.squareFeet && (
                    <span className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.squareFeet.toLocaleString()} sqft
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-right space-y-1 mb-3">
                  <div className="text-lg font-bold text-primary">
                    보증금 {property.deposit?.toLocaleString()}만원
                  </div>
                  <div className="text-lg font-bold text-primary">
                    월세 {property.monthlyRent?.toLocaleString()}만원
                  </div>
                  <div className="text-sm text-neutral-600">
                    관리비 {property.maintenanceFee ? `${property.maintenanceFee.toLocaleString()}만원` : '알 수 없음'}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onTranslate();
                    }}
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                  <Link href={`/property/${property.id}`}>
                    <Button size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative">
        <Link href={`/property/${property.id}`}>
          <img
            src={property.photos[0] || "/placeholder-property.jpg"}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>
        
        <div className="absolute top-4 left-4">
          <Badge variant={property.listingType === "sale" ? "default" : "secondary"}>
            For {property.listingType === "sale" ? "Sale" : "Rent"}
          </Badge>
        </div>
        
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/80 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPropertyTypeIcon(property.propertyType)}</span>
            <Link href={`/property/${property.id}`}>
              <h3 className="text-xl font-semibold text-neutral-900 hover:text-primary transition-colors cursor-pointer">
                {property.title}
              </h3>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onTranslate();
            }}
          >
            <Languages className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-neutral-600 mb-4 line-clamp-2">{property.description}</p>
        
        <div className="flex items-center text-sm text-neutral-500 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.address}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4 text-sm text-neutral-600">
            <span className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms || 0} bed{property.bedrooms !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms || 0} bath{property.bathrooms !== 1 ? 's' : ''}
            </span>
            {property.squareFeet && (
              <span className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                {property.squareFeet.toLocaleString()} sqft
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(property.price, property.listingType)}
          </span>
          <Link href={`/property/${property.id}`}>
            <Button>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
