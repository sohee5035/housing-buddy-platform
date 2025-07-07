import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, MapPin, Building, DollarSign, CreditCard, ChevronDown, ChevronUp } from "lucide-react";

interface SearchFilters {
  city?: string;
  propertyType?: string;
  priceRange?: string;
  listingType?: string;
  search?: string;
  depositMin?: number;
  depositMax?: number;
  monthlyRentMin?: number;
  monthlyRentMax?: number;
  includeMaintenanceFee?: boolean;
}

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [depositMin, setDepositMin] = useState("");
  const [depositMax, setDepositMax] = useState("");
  const [monthlyRentMin, setMonthlyRentMin] = useState("");
  const [monthlyRentMax, setMonthlyRentMax] = useState("");
  const [includeMaintenanceFee, setIncludeMaintenanceFee] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSearch = () => {
    const filters: SearchFilters = {};
    
    if (searchText.trim()) filters.search = searchText.trim();
    if (city && city !== "any") filters.city = city;
    if (propertyType && propertyType !== "any") filters.propertyType = propertyType;
    if (priceRange && priceRange !== "any") filters.priceRange = priceRange;
    
    // 가격 필터
    if (depositMin && !isNaN(Number(depositMin))) filters.depositMin = Number(depositMin) * 10000;
    if (depositMax && !isNaN(Number(depositMax))) filters.depositMax = Number(depositMax) * 10000;
    if (monthlyRentMin && !isNaN(Number(monthlyRentMin))) filters.monthlyRentMin = Number(monthlyRentMin) * 10000;
    if (monthlyRentMax && !isNaN(Number(monthlyRentMax))) filters.monthlyRentMax = Number(monthlyRentMax) * 10000;
    filters.includeMaintenanceFee = includeMaintenanceFee;
    
    onSearch(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-2xl max-w-6xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* 첫 번째 줄: 검색 입력 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              매물 검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="제목, 설명, 위치로 검색"
                className="pl-10"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* 고급 필터 섹션 */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                type="button"
              >
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  고급 검색 필터
                </span>
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-4">
              {/* 기본 필터들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    지역
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400 z-10" />
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="전체 지역" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">전체 지역</SelectItem>
                        <SelectItem value="서울특별시">서울특별시</SelectItem>
                        <SelectItem value="경기도">경기도</SelectItem>
                        <SelectItem value="인천광역시">인천광역시</SelectItem>
                        <SelectItem value="부산광역시">부산광역시</SelectItem>
                        <SelectItem value="대구광역시">대구광역시</SelectItem>
                        <SelectItem value="대전광역시">대전광역시</SelectItem>
                        <SelectItem value="광주광역시">광주광역시</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Property Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    매물 유형
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-neutral-400 z-10" />
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="전체 유형" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">전체 유형</SelectItem>
                        <SelectItem value="원룸">원룸</SelectItem>
                        <SelectItem value="투룸">투룸</SelectItem>
                        <SelectItem value="쓰리룸">쓰리룸</SelectItem>
                        <SelectItem value="오피스텔">오피스텔</SelectItem>
                        <SelectItem value="아파트">아파트</SelectItem>
                        <SelectItem value="빌라">빌라</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    카테고리
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400 z-10" />
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="전체 카테고리" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">전체 카테고리</SelectItem>
                        <SelectItem value="단기임대">단기임대</SelectItem>
                        <SelectItem value="장기임대">장기임대</SelectItem>
                        <SelectItem value="월세">월세</SelectItem>
                        <SelectItem value="전세">전세</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 가격 필터 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  가격 필터
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 보증금 필터 */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      보증금 (만원)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="최소"
                        value={depositMin}
                        onChange={(e) => setDepositMin(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-neutral-500">~</span>
                      <Input
                        type="number"
                        placeholder="최대"
                        value={depositMax}
                        onChange={(e) => setDepositMax(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* 월세 필터 */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      월세 (만원)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="최소"
                        value={monthlyRentMin}
                        onChange={(e) => setMonthlyRentMin(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-neutral-500">~</span>
                      <Input
                        type="number"
                        placeholder="최대"
                        value={monthlyRentMax}
                        onChange={(e) => setMonthlyRentMax(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 관리비 포함 옵션 */}
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMaintenanceFee"
                      checked={includeMaintenanceFee}
                      onCheckedChange={(checked) => setIncludeMaintenanceFee(checked as boolean)}
                    />
                    <label
                      htmlFor="includeMaintenanceFee"
                      className="text-sm font-medium text-neutral-700 cursor-pointer"
                    >
                      월세에 관리비 포함하여 계산
                    </label>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1 sm:flex-none px-8"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            매물 검색
          </Button>
          <Button 
            variant="outline"
            className="flex-1 sm:flex-none px-8"
            onClick={() => {
              setSearchText('');
              setCity('');
              setPropertyType('');
              setPriceRange('');
              setDepositMin('');
              setDepositMax('');
              setMonthlyRentMin('');
              setMonthlyRentMax('');
              setIncludeMaintenanceFee(false);
              setIsAdvancedOpen(false);
              onSearch({});
            }}
          >
            필터 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
