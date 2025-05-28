import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import Navbar from "@/components/navbar";
import SearchForm from "@/components/search-form";
import PropertyCard from "@/components/property-card";
import PropertyForm from "@/components/property-form";
import TranslationModal from "@/components/translation-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Grid3X3, List } from "lucide-react";

interface SearchFilters {
  city?: string;
  propertyType?: string;
  priceRange?: string;
  listingType?: string;
  search?: string;
}

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedPropertyForTranslation, setSelectedPropertyForTranslation] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: properties = [], isLoading, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchFilters.city) params.append("city", searchFilters.city);
      if (searchFilters.propertyType) params.append("propertyType", searchFilters.propertyType);
      if (searchFilters.listingType) params.append("listingType", searchFilters.listingType);
      if (searchFilters.search) params.append("search", searchFilters.search);
      
      // Handle price range
      if (searchFilters.priceRange && searchFilters.priceRange !== "any") {
        const ranges: Record<string, { min: number; max: number }> = {
          "100k-300k": { min: 100000, max: 300000 },
          "300k-500k": { min: 300000, max: 500000 },
          "500k-1m": { min: 500000, max: 1000000 },
          "1m+": { min: 1000000, max: Infinity },
        };
        const range = ranges[searchFilters.priceRange];
        if (range) {
          params.append("minPrice", range.min.toString());
          if (range.max !== Infinity) {
            params.append("maxPrice", range.max.toString());
          }
        }
      }

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleTranslate = (property: Property) => {
    setSelectedPropertyForTranslation(property);
    setShowTranslationModal(true);
  };

  const filteredProperties = properties.filter(property => {
    if (activeFilter === "all") return true;
    if (activeFilter === "sale") return property.listingType === "sale";
    if (activeFilter === "rent") return property.listingType === "rent";
    return true;
  });

  const stats = {
    totalListings: properties.length,
    citiesCovered: new Set(properties.map(p => p.city)).size,
    happyClients: "98%",
    languages: "23"
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onCreateListing={() => setShowCreateModal(true)} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Dream Property
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover premium real estate listings with advanced search, multi-language support, and stunning visuals
            </p>
          </div>
          
          <SearchForm onSearch={handleSearch} />
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Featured Properties</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Discover our handpicked premium listings from around the world</p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "sale", label: "For Sale" },
                { key: "rent", label: "For Rent" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex border border-neutral-300 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-l-lg rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-r-lg rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 bg-neutral-200 animate-pulse" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-3 bg-neutral-200 rounded animate-pulse w-3/4" />
                    <div className="h-6 bg-neutral-200 rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No properties found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search filters or create a new listing</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Listing
              </Button>
            </div>
          ) : (
            <div className={`grid gap-8 mb-12 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onTranslate={() => handleTranslate(property)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.totalListings}</div>
              <div className="text-neutral-600">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.citiesCovered}</div>
              <div className="text-neutral-600">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.happyClients}</div>
              <div className="text-neutral-600">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.languages}</div>
              <div className="text-neutral-600">Languages Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="text-primary text-2xl mr-2">🏠</div>
                <span className="text-xl font-bold">PropertyHub</span>
              </div>
              <p className="text-neutral-300 mb-6 max-w-md">
                Your premier destination for discovering exceptional real estate opportunities worldwide. 
                We connect buyers, sellers, and renters with premium properties across the globe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-neutral-300">
                <li>Browse Properties</li>
                <li>List Your Property</li>
                <li>Find Agents</li>
                <li>Market Insights</li>
                <li>About Us</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-300">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 PropertyHub. All rights reserved. | Powered by React & TypeScript</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <PropertyForm 
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        property={selectedPropertyForTranslation}
      />

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 md:hidden shadow-lg"
        size="icon"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
