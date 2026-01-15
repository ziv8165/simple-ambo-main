import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, SlidersHorizontal, X, Bookmark } from 'lucide-react';
import SaveSearchDialog from './SaveSearchDialog';

const israelCities = [
  'תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'נתניה', 'ראשון לציון',
  'פתח תקווה', 'אשדוד', 'רמת גן', 'הרצליה', 'חולון', 'בת ים'
];

const amenitiesOptions = [
  { value: 'WIFI', label: 'אינטרנט אלחוטי' },
  { value: 'AC', label: 'מיזוג אוויר' },
  { value: 'WASHER', label: 'מכונת כביסה' },
  { value: 'PARKING', label: 'חניה' },
  { value: 'ELEVATOR', label: 'מעלית' },
  { value: 'BALCONY', label: 'מרפסת' }
];

export default function SearchFilters({ onSearch, onSaveSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: 0,
    maxPrice: 10000,
    bedrooms: '',
    minArea: 0,
    maxArea: 200,
    amenities: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['savedSearches', user?.id],
    queryFn: () => base44.entities.SavedSearch.filter({ userId: user?.id }),
    enabled: !!user
  });

  // Auto-complete suggestions
  const suggestions = searchQuery 
    ? israelCities.filter(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : israelCities.slice(0, 5);

  const handleSearch = () => {
    const searchCriteria = {
      ...filters,
      city: filters.city || searchQuery
    };
    onSearch(searchCriteria);
    setShowSuggestions(false);
  };

  const loadSavedSearch = (search) => {
    setFilters(search.criteria);
    setSearchQuery(search.criteria.city || '');
    onSearch(search.criteria);
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: '',
      minArea: 0,
      maxArea: 200,
      amenities: []
    });
    setSearchQuery('');
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const activeFiltersCount = [
    filters.city,
    filters.bedrooms,
    filters.amenities.length > 0,
    filters.minPrice > 0 || filters.maxPrice < 10000,
    filters.minArea > 0 || filters.maxArea < 200
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto" dir="rtl">
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="היכן תרצה לגור?"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="h-12 pr-10 text-base"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-60 overflow-auto">
                {suggestions.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSearchQuery(city);
                      setFilters(prev => ({ ...prev, city }));
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors text-[#1A1A1A]"
                  >
                    {city}
                  </button>
                ))}
                
                {savedSearches.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 font-medium">
                      חיפושים שמורים
                    </div>
                    {savedSearches.slice(0, 3).map((search) => (
                      <button
                        key={search.id}
                        onClick={() => {
                          loadSavedSearch(search);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-right hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-blue-500" />
                          <span className="text-[#1A1A1A]">{search.name}</span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 px-6 relative"
              >
                <SlidersHorizontal className="w-5 h-5 ml-2" />
                מסננים
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#E3C766] text-[#1A1A1A] rounded-full text-xs flex items-center justify-center font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-6" align="start" dir="rtl">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#1A1A1A]">מסננים מתקדמים</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4 ml-1" />
                    נקה הכל
                  </Button>
                </div>

                {/* City */}
                <div>
                  <Label className="mb-2">עיר</Label>
                  <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר עיר" />
                    </SelectTrigger>
                    <SelectContent>
                      {israelCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="mb-3">טווח מחיר ללילה</Label>
                  <div className="space-y-3">
                    <Slider
                      value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                      max={10000}
                      step={100}
                      className="mt-2"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>₪{filters.minPrice.toLocaleString()}</span>
                      <span>₪{filters.maxPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <Label className="mb-2">מספר חדרים</Label>
                  <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="כל המספרים" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 חדר</SelectItem>
                      <SelectItem value="2">2 חדרים</SelectItem>
                      <SelectItem value="3">3 חדרים</SelectItem>
                      <SelectItem value="4">4+ חדרים</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Area */}
                <div>
                  <Label className="mb-3">שטח (מ"ר)</Label>
                  <div className="space-y-3">
                    <Slider
                      value={[filters.minArea, filters.maxArea]}
                      onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minArea: min, maxArea: max }))}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{filters.minArea} מ"ר</span>
                      <span>{filters.maxArea} מ"ר</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <Label className="mb-3">מתקנים</Label>
                  <div className="space-y-2">
                    {amenitiesOptions.map(({ value, label }) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={value}
                          checked={filters.amenities.includes(value)}
                          onCheckedChange={() => toggleAmenity(value)}
                        />
                        <Label htmlFor={value} className="cursor-pointer text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      handleSearch();
                      setShowAdvanced(false);
                    }}
                    className="flex-1 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
                  >
                    החל מסננים
                  </Button>
                  {user && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSaveDialogOpen(true);
                        setShowAdvanced(false);
                      }}
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            onClick={handleSearch}
            className="h-12 px-8 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
          >
            חפש
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">מסננים פעילים:</span>
          {filters.city && (
            <span className="px-3 py-1 bg-white rounded-full text-sm border">
              {filters.city}
            </span>
          )}
          {filters.bedrooms && (
            <span className="px-3 py-1 bg-white rounded-full text-sm border">
              {filters.bedrooms} חדרים
            </span>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
            <span className="px-3 py-1 bg-white rounded-full text-sm border">
              ₪{filters.minPrice.toLocaleString()} - ₪{filters.maxPrice.toLocaleString()}
            </span>
          )}
          {filters.amenities.length > 0 && (
            <span className="px-3 py-1 bg-white rounded-full text-sm border">
              {filters.amenities.length} מתקנים
            </span>
          )}
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
          >
            נקה הכל
          </button>
        </div>
      )}

      {user && (
        <SaveSearchDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          searchCriteria={filters}
        />
      )}
    </div>
  );
}