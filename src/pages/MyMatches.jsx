import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Maximize2, Home, Sparkles, AlertCircle } from 'lucide-react';

// תגיות בעברית
const TAG_LABELS = {
  VEGAN: 'טבעוני',
  QUIET: 'שקט ורגוע',
  SOCIAL: 'חברתי ומארח',
  WFH: 'עובדים מהבית',
  CLEAN: 'נקי ומסודר',
  STUDENT_VIBE: 'אווירת סטודנטים',
  SPIRITUAL: 'רוחני',
  FLOWING: 'זורם',
  PARTY_LOVER: 'אוהב מסיבות',
  NEAR_TRAIN: 'רכבת/רק"ל',
  NEAR_BUS: 'תחב"צ נגישה',
  NEAR_SUPER: 'סופר/מכולת',
  NEAR_GYM: 'חדר כושר/ספורט',
  NEAR_NIGHTLIFE: 'חיי לילה/ברים',
  NEAR_PARK: 'פארק/גינה',
  NEAR_SEA: 'מרחק הליכה לים',
  NEAR_COFFEE: 'בתי קפה',
  NEAR_HEALTH: 'שירותי רפואה'
};

// Conflict pairs for advanced matching
const CONFLICT_PAIRS = {
  'QUIET': 'SOCIAL',
  'SOCIAL': 'QUIET',
  'CLEAN': 'FLOWING',
  'FLOWING': 'CLEAN',
  'PARTY_LOVER': 'QUIET',
  'SPIRITUAL': 'PARTY_LOVER'
};

// פונקציית החישוב המלאה (כולל conflicts)
function calculateFinalMatch(seekerPrefs, listingData) {
  if (!seekerPrefs?.hasCompletedQuiz) return null;

  let score = 100;

  // חוקי ברזל (Deal Breakers)
  if (listingData.city !== seekerPrefs.wantedCity) return 0;
  if (seekerPrefs.hasPet && !listingData.petsAllowed) score -= 40;
  if (seekerPrefs.isNonSmoker && listingData.smokingPolicy === 'ALLOWED') score -= 30;

  // התאמה חכמה עם Conflicts
  const wantedTags = [
    ...(seekerPrefs.vibeTags || []),
    ...(seekerPrefs.proximityTags || [])
  ];

  const listingTags = [
    ...(listingData.vibeTags || []),
    ...(listingData.proximityTags || [])
  ];

  wantedTags.forEach((tag) => {
    if (listingTags.includes(tag)) {
      // Match found - no penalty
    } else {
      // Miss found - check for conflict
      const opposite = CONFLICT_PAIRS[tag];
      if (opposite && listingTags.includes(opposite)) {
        score -= 15; // Major conflict
      } else {
        score -= 5;  // Soft miss (5% rule)
      }
    }
  });

  return Math.max(0, score);
}

export default function MyMatches() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: preferences } = useQuery({
    queryKey: ['userMatchPreferences', user?.id],
    queryFn: () => base44.entities.UserMatchPreferences.filter({ userId: user.id }),
    enabled: !!user?.id,
    select: (data) => data?.[0]
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  // חישוב התאמות
  const matchedListings = useMemo(() => {
    if (!preferences?.hasCompletedQuiz) return [];

    const withScores = listings
      .map((listing) => ({
        ...listing,
        matchScore: calculateFinalMatch(preferences, listing)
      }))
      .filter((listing) => listing.matchScore !== null && listing.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return withScores;
  }, [listings, preferences]);

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'התאמה מושלמת';
    if (score >= 75) return 'התאמה גבוהה';
    if (score >= 60) return 'התאמה טובה';
    return 'התאמה בסיסית';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
        </div>

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <p className="text-[#4A2525]">טוען...</p>
        </div>
      </div>
    );
  }

  if (!preferences?.hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
        </div>

        <div className="pb-16 relative z-10">
          <div className="max-w-2xl mx-auto px-6">
            <Card className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-[#E3C766] mx-auto mb-4" />
              <h2 className="text-2xl font-light text-[#1A1A1A] mb-3">
                טרם מילאת את שאלון ההתאמות
              </h2>
              <p className="text-[#422525]/70 mb-6">
                כדי לקבל המלצות מותאמות אישית, עליך למלא את השאלון תחילה
              </p>
              <Button
                onClick={() => navigate(createPageUrl('MatchingQuiz'))}
                className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
              >
                למלא שאלון התאמות
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-[#BC5D34]" />
              <h1 className="text-3xl font-bold text-[#4A2525]" style={{ fontFamily: 'League Spartan, sans-serif' }}>ההתאמות שלי</h1>
            </div>
            <p className="text-[#422525]/70">
              מצאנו {matchedListings.length} דירות שמתאימות להעדפות שלך
            </p>
          </div>

          {/* Listings Grid */}
          {matchedListings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[#422525]/70">לא נמצאו דירות מתאימות כרגע</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(createPageUrl('ListingDetails'))}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
                      alt={listing.title || listing.neighborhood}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`${getScoreBadgeColor(listing.matchScore)} text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5`}>
                        <Sparkles className="w-4 h-4" />
                        {listing.matchScore}% התאמה
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button className="absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all">
                      <Heart className="w-5 h-5 text-[#422525]" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-[#1A1A1A] mb-2 line-clamp-1">
                      {listing.neighborhood || listing.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-[#422525]/70 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.city}</span>
                    </div>

                    {/* Match Label */}
                    <Badge className="bg-[#E6DDD0] text-[#422525] mb-3">
                      {getScoreLabel(listing.matchScore)}
                    </Badge>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-[#422525]/70 mb-3">
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        <span>{listing.bedrooms} חדרים</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-4 h-4" />
                        <span>{listing.areaSqMeters} מ"ר</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E6DDD0]">
                      <span className="text-2xl font-medium text-[#1A1A1A]">
                        ₪{listing.pricePerNight?.toLocaleString()}
                      </span>
                      <span className="text-sm text-[#422525]/60">ללילה</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}