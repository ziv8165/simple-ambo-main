import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare, ArrowRight, Home, Maximize2, MapPin, Check, X } from 'lucide-react';


export default function CompareListings() {
  const navigate = useNavigate();
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('compareListings');
    if (stored) {
      setCompareIds(JSON.parse(stored));
    }
  }, []);

  const { data: allListings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  const compareListings = allListings.filter(l => compareIds.includes(l.id));

  if (compareListings.length < 2) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
        </div>

        <div className="pb-16 px-6 text-center relative z-10">
          <GitCompare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-[#1A1A1A] mb-2">בחר לפחות 2 דירות להשוואה</h1>
          <p className="text-[#422525]/60 mb-6">חזור לדף הבית והוסף דירות להשוואה</p>
          <Button asChild className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]">
            <a href={createPageUrl('Home')}>
              <ArrowRight className="w-4 h-4 ml-2 rotate-180" />
              חזרה לדף הבית
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const comparisonRows = [
    { label: 'עיר', key: 'city' },
    { label: 'שכונה', key: 'neighborhood' },
    { label: 'מחיר ללילה', key: 'pricePerNight', format: (v) => `₪${v?.toLocaleString()}` },
    { label: 'חדרים', key: 'bedrooms' },
    { label: 'שטח (מ"ר)', key: 'areaSqMeters' },
    { label: 'קומה', key: 'floor' },
    { label: 'ריהוט', key: 'furnishedStatus', format: (v) => ({ FULL: 'מלא', PARTIAL: 'חלקי', NONE: 'ללא' }[v]) },
    { label: 'מעלית', key: 'has_elevator', format: (v) => v ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" /> },
    { label: 'מיזוג', key: 'amenities_categorized', format: (v) => v?.heating_cooling?.includes('AC') ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" /> },
    { label: 'Wi-Fi', key: 'amenities_categorized', format: (v) => v?.internet?.includes('WIFI') ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" /> },
    { label: 'מרפסת', key: 'amenities_categorized', format: (v) => v?.location?.includes('PRIVATE_PATIO_BALCONY') ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" /> },
    { label: 'חניה', key: 'guest_access', format: (v) => v?.toLowerCase().includes('חניה') ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" /> }
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-[#BC5D34]" />
            <h1 className="text-3xl font-bold text-[#4A2525]" style={{ fontFamily: 'League Spartan, sans-serif' }}>השוואת דירות</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('compareListings');
              navigate(createPageUrl('Home'));
            }}
          >
            נקה והחזר לדף הבית
          </Button>
        </div>

        {/* Listing Cards */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${compareListings.length}, minmax(0, 1fr))` }}>
          {compareListings.map(listing => (
            <Card key={listing.id}>
              <div className="relative h-40">
                <img
                  src={listing.photos?.[0] || 'https://via.placeholder.com/400'}
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-[#1A1A1A] mb-1 line-clamp-2">
                  {listing.title || `דירה ב${listing.city}`}
                </h3>
                <div className="flex items-center gap-1 text-sm text-[#422525]/70">
                  <MapPin className="w-3 h-3" />
                  <span>{listing.city}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={row.label} className={idx % 2 === 0 ? 'bg-[#FDFCF8]' : 'bg-white'}>
                      <td className="p-4 font-medium text-[#1A1A1A] border-l border-[#E6DDD0] sticky right-0 bg-inherit">
                        {row.label}
                      </td>
                      {compareListings.map(listing => {
                        const value = listing[row.key];
                        const displayValue = row.format ? row.format(value) : value || '-';
                        return (
                          <td key={listing.id} className="p-4 text-center text-[#422525]">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          {compareListings.map(listing => (
            <Button
              key={listing.id}
              asChild
              className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
            >
              <a href={createPageUrl('ListingDetails')}>
                צפה בדירה - {listing.neighborhood}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}