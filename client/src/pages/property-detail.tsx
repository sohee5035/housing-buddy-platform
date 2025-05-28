import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useState } from "react";
import PropertyForm from "@/components/property-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Home as HomeIcon,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Property not found");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-4">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-4 text-center py-16">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Property Not Found</h1>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.photos.length - 1 : prev - 1
    );
  };

  const formatPrice = (price: number, listingType: string) => {
    return listingType === "rent" 
      ? `$${price.toLocaleString()}/mo`
      : `$${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        {/* Image Carousel */}
        <div className="relative h-96 bg-neutral-200 rounded-2xl overflow-hidden mb-8">
          {property.photos.length > 0 ? (
            <>
              <img
                src={property.photos[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {property.photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {property.photos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <div>No images available</div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-3">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/80 backdrop-blur-sm"
              onClick={() => setShowTranslationModal(true)}
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/80 backdrop-blur-sm"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className={`bg-white/80 backdrop-blur-sm ${
                isFavorite ? 'text-red-500' : ''
              }`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          {/* Listing Type Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge variant={property.listingType === "sale" ? "default" : "secondary"}>
              For {property.listingType === "sale" ? "Sale" : "Rent"}
            </Badge>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-neutral-500 mb-4">
                <span className="mr-2">📍</span>
                <span>{property.address}</span>
              </div>
              <div className="text-4xl font-bold text-primary">
                {formatPrice(property.price, property.listingType)}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Description</h3>
              <p className="text-neutral-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Property Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Property Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center text-neutral-600">
                  <Bed className="h-5 w-5 mr-2 text-primary" />
                  <span>{property.bedrooms || 0} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <Bath className="h-5 w-5 mr-2 text-primary" />
                  <span>{property.bathrooms || 0} Bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
                {property.squareFeet && (
                  <div className="flex items-center text-neutral-600">
                    <Square className="h-5 w-5 mr-2 text-primary" />
                    <span>{property.squareFeet.toLocaleString()} sqft</span>
                  </div>
                )}
                <div className="flex items-center text-neutral-600">
                  <Car className="h-5 w-5 mr-2 text-primary" />
                  <span>1 Parking</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <span>Built in 2020</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <PawPrint className="h-5 w-5 mr-2 text-primary" />
                  <span>Pet Friendly</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Swimming Pool",
                  "Fitness Center", 
                  "24/7 Concierge",
                  "Rooftop Garden"
                ].map((amenity, index) => (
                  <div key={index} className="flex items-center text-neutral-600">
                    <span className="mr-2">✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Agent Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Contact Agent</h3>
                
                <div className="flex items-center mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                    alt="Agent profile"
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">Sarah Johnson</div>
                    <div className="text-sm text-neutral-600">Senior Real Estate Agent</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <Button className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Schedule Viewing
                  </Button>
                </div>
                
                <div className="text-sm text-neutral-600">
                  <div className="flex justify-between mb-2">
                    <span>Response Rate:</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Response Time:</span>
                    <span className="font-medium">2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        property={property}
      />
    </div>
  );
}
