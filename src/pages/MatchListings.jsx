import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';


const VIBE_OPTIONS = [
  { value: 'QUIET_CALM', label: 'שקט ורגוע' },
  { value: 'SOCIAL_HOSTING', label: 'חברתי ומארח' },
  { value: 'STUDENT_VIBE', label: 'סטודנטי' },
  { value: 'WORK_FROM_HOME', label: 'עובדים מהבית' },
  { value: 'VEGAN', label: 'טבעוני' },
  { value: 'SPIRITUAL', label: 'רוחני ומודע' },
  { value: 'CLEAN_TIDY', label: 'נקי ומסודר' },
  { value: 'FLOWING', label: 'רגוע וזורם' },
  { value: 'PARTY_LOVER', label: 'אוהב מסיבות' }
];

const AMENITY_OPTIONS = [
  { value: 'WIFI', label: 'Wi-Fi' },
  { value: 'AC', label: 'מזגן' },
  { value: 'PARKING_PRIVATE', label: 'חניה פרטית' },
  { value: 'DESK_CHAIR', label: 'שולחן עבודה' },
  { value: 'WASHING_MACHINE', label: 'מכונת כביסה' },
  { value: 'BALCONY', label: 'מרפסת' }
];

export default function MatchListings() {
  const [guestPreferences, setGuestPreferences] = useState({
    vibes: [],
    amenities: [],
    noSmoking: true,
    preferredGender: null
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  // Calculate Match Score
  const calculateMatch = (listing, guestReq) => {
    let score = 100;
    const breakdown = [];

    // Kill Switch: Smoking
    if (listing.rules?.smokingAllowed && guestReq.noSmoking) {
      breakdown.push({ reason: 'עישון מותר בדירה', impact: -100 });
      return { score: 0, breakdown };
    }

    // Kill Switch: Gender
    if (guestReq.preferredGender && listing.roommatesInfo?.gender) {
      if (listing.roommatesInfo.gender !== guestReq.preferredGender && listing.roommatesInfo.gender !== 'MIXED') {
        breakdown.push({ reason: 'מגדר שותפים לא מתאים', impact: -100 });
        return { score: 0, breakdown };
      }
    }

    // Vibe Match
    const listingVibes = listing.vibes || [];
    const commonVibes = guestReq.vibes.filter(v => listingVibes.includes(v));
    
    if (guestReq.vibes.length > 0 && commonVibes.length === 0) {
      score -= 20;
      breakdown.push({ reason: 'אין וייב משותף', impact: -20 });
    } else if (commonVibes.length > 0) {
      breakdown.push({ reason: `${commonVibes.length} וייבים משותפים`, impact: 0 });
    }

    // Amenities Match
    const listingAmenities = listing.amenities || [];
    guestReq.amenities.forEach(needed => {
      if (!listingAmenities.includes(needed)) {
        const penalty = needed === 'DESK_CHAIR' ? -15 : needed === 'PARKING_PRIVATE' ? -15 : -10;
        score += penalty;
        const labels = { 'DESK_CHAIR': 'שולחן עבודה', 'PARKING_PRIVATE': 'חניה', 'WIFI': 'Wi-Fi' };
        breakdown.push({ reason: `חסר: ${labels[needed] || needed}`, impact: penalty });
      }
    });

    return { score: Math.max(0, score), breakdown };
  };

  const rankedListings = listings.map(listing => {
    const match = calculateMatch(listing, guestPreferences);
    return { ...listing, matchScore: match.score, matchBreakdown: match.breakdown };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const toggleVibe = (vibe) => {
    setGuestPreferences(prev => ({
      ...prev,
      vibes: prev.vibes.includes(vibe)
        ? prev.vibes.filter(v => v !== vibe)
        : [...prev.vibes, vibe]
    }));
  };

  const toggleAmenity = (amenity) => {
    setGuestPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-[#BC5D34]" />
          <h1 className="text-3xl font-bold text-[#4A2525]" style={{ fontFamily: 'League Spartan, sans-serif' }}>שידוך חכם</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Preferences Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">העדפות שלי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">וייב</h3>
                  <div className="space-y-2">
                    {VIBE_OPTIONS.map(vibe => (
                      <div key={vibe.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={guestPreferences.vibes.includes(vibe.value)}
                          onCheckedChange={() => toggleVibe(vibe.value)}
                        />
                        <label className="text-sm">{vibe.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">מתקנים נדרשים</h3>
                  <div className="space-y-2">
                    {AMENITY_OPTIONS.map(amenity => (
                      <div key={amenity.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={guestPreferences.amenities.includes(amenity.value)}
                          onCheckedChange={() => toggleAmenity(amenity.value)}
                        />
                        <label className="text-sm">{amenity.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">כללים</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={guestPreferences.noSmoking}
                      onCheckedChange={(checked) => 
                        setGuestPreferences(prev => ({ ...prev, noSmoking: checked }))
                      }
                    />
                    <label className="text-sm">ללא עישון</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {rankedListings.length === 0 && (
              <div className="text-center py-16 text-[#422525]/60">
                אין דירות במערכת
              </div>
            )}
            
            {rankedListings.map(listing => (
              <Card key={listing.id} className={listing.matchScore === 0 ? 'opacity-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
                        {listing.title || `דירה ב${listing.city}`}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {listing.vibes?.map(vibe => (
                          <Badge key={vibe} variant="outline" className="text-xs">
                            {VIBE_OPTIONS.find(v => v.value === vibe)?.label || vibe}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-[#422525]/70">
                        {listing.city} • ₪{listing.pricePerNight}/לילה
                      </p>
                      
                      {/* Match Breakdown */}
                      {listing.matchBreakdown?.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {listing.matchBreakdown.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {item.impact < 0 ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              )}
                              <span className="text-[#422525]/60">
                                {item.reason} {item.impact !== 0 && `(${item.impact > 0 ? '+' : ''}${item.impact})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        listing.matchScore >= 80 ? 'text-green-600' :
                        listing.matchScore >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {listing.matchScore}
                      </div>
                      <div className="text-xs text-[#422525]/50">Match Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}