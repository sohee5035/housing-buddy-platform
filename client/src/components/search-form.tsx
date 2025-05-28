import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Building, DollarSign } from "lucide-react";

interface SearchFilters {
  city?: string;
  propertyType?: string;
  priceRange?: string;
  listingType?: string;
  search?: string;
}

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = () => {
    const filters: SearchFilters = {};
    
    if (searchText.trim()) filters.search = searchText.trim();
    if (city && city !== "any") filters.city = city;
    if (propertyType && propertyType !== "any") filters.propertyType = propertyType;
    if (priceRange && priceRange !== "any") filters.priceRange = priceRange;
    
    onSearch(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search Properties
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by title, description, or location"
                className="pl-10"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400 z-10" />
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Any Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Location</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Houston">Houston</SelectItem>
                  <SelectItem value="Miami">Miami</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="Seattle">Seattle</SelectItem>
                  <SelectItem value="Boston">Boston</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Property Type
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-neutral-400 z-10" />
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Price Range
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400 z-10" />
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="100k-300k">$100K - $300K</SelectItem>
                  <SelectItem value="300k-500k">$300K - $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="1m+">$1M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            className="w-full md:w-auto px-8"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Properties
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
