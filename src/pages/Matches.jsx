import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart } from 'lucide-react';
import PropertyCard from '@/components/listings/PropertyCard';

const VIBE_LABELS = {
  VEGAN: 'Vegan',
  QUIET: 'Quiet',
  SOCIAL: 'Social',
  WFH: 'Work From Home',
  CLEAN: 'Clean',
  STUDENT_VIBE: 'Student Vibe',
  SPIRITUAL: 'Spiritual',
  FLOWING: 'Flowing',
  PARTY_LOVER: 'Party Lover'
};

const PROXIMITY_LABELS = {
  NEAR_TRAIN: 'Near Train',
  NEAR_BUS: 'Near Bus',
  NEAR_SUPER: 'Near Supermarket',
  NEAR_GYM: 'Near Gym',
  NEAR_NIGHTLIFE: 'Near Nightlife',
  NEAR_PARK: 'Near Park',
  NEAR_SEA: 'Near Sea',
  NEAR_COFFEE: 'Near Coffee Shop',
  NEAR_HEALTH: 'Near Health Services'
};

const CONFLICT_PAIRS = [
  ['QUIET', 'PARTY_LOVER'],
  ['QUIET', 'SOCIAL'],
  ['SPIRITUAL', 'PARTY_LOVER']
];

function calculateFinalMatch(userPrefs, listing) {
  if (!userPrefs || !listing) return 0;

  let score = 0;
  let maxScore = 0;

  // City Match (Deal Breaker)
  if (userPrefs.wantedCity && listing.city !== userPrefs.wantedCity) {
    return 0;
  }

  // Pet Deal Breaker
  if (userPrefs.hasPet && !listing.petsAllowed) {
    return 0;
  }

  // Smoking Deal Breaker
  if (userPrefs.isNonSmoker && listing.smokingPolicy === 'ALLOWED') {
    return 0;
  }

  // Budget Deal Breaker
  if (userPrefs.budgetMin && listing.pricePerNight < userPrefs.budgetMin) {
    return 0;
  }
  if (userPrefs.budgetMax && listing.pricePerNight > userPrefs.budgetMax) {
    return 0;
  }

  // Vibe Tags Matching
  if (userPrefs.vibeTags && userPrefs.vibeTags.length > 0) {
    maxScore += userPrefs.vibeTags.length * 10;
    const listingVibes = listing.vibeTags || [];
    userPrefs.vibeTags.forEach(userTag => {
      if (listingVibes.includes(userTag)) {
        score += 10;
      }
    });

    // Check for conflicts
    userPrefs.vibeTags.forEach(userTag => {
      CONFLICT_PAIRS.forEach(([tag1, tag2]) => {
        if (userTag === tag1 && listingVibes.includes(tag2)) {
          score -= 15;
        }
        if (userTag === tag2 && listingVibes.includes(tag1)) {
          score -= 15;
        }
      });
    });
  }

  // Proximity Tags Matching
  if (userPrefs.proximityTags && userPrefs.proximityTags.length > 0) {
    maxScore += userPrefs.proximityTags.length * 5;
    const listingProximity = listing.proximityTags || [];
    userPrefs.proximityTags.forEach(userTag => {
      if (listingProximity.includes(userTag)) {
        score += 5;
      }
    });
  }

  if (maxScore === 0) return 50;
  
  const percentage = Math.round((score / maxScore) * 100);
  return Math.max(0, Math.min(100, percentage));
}

export default function Matches() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: () => base44.entities.UserMatchPreferences.filter({ userId: user.id }),
    enabled: !!user
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  const userPrefs = preferences?.[0];

  // Calculate matches
  const matchedListings = React.useMemo(() => {
    if (!userPrefs || !userPrefs.hasCompletedQuiz) return [];
    
    return listings
      .map(listing => ({
        ...listing,
        matchScore: calculateFinalMatch(userPrefs, listing)
      }))
      .filter(listing => listing.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [listings, userPrefs]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#4A2525]/70 mb-4">Please sign in to view your matches</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-[#BC5D34] hover:bg-[#A04D2A]">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!userPrefs || !userPrefs.hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-32 text-center">
          <Sparkles className="w-16 h-16 text-[#BC5D34] mx-auto mb-6" />
          <h1 
            className="text-4xl font-bold text-[#4A2525] mb-4"
            style={{ fontFamily: 'League Spartan, sans-serif' }}
          >
            Find Your Perfect Match
          </h1>
          <p className="text-lg text-[#4A2525]/70 mb-8">
            Take our quick quiz to discover properties that match your lifestyle and preferences
          </p>
          <Button 
            asChild 
            className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A] text-lg px-8 py-6"
          >
            <Link to={createPageUrl('MatchingQuiz')}>
              Start the Quiz
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#BC5D34]" />
            <h1 
              className="text-4xl font-bold text-[#4A2525]"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              Your Matches
            </h1>
          </div>
          <p className="text-lg text-[#4A2525]/70">
            Properties ranked by compatibility with your preferences
          </p>
          <Button 
            asChild 
            variant="outline" 
            className="mt-4"
          >
            <Link to={createPageUrl('MatchingQuiz')}>
              Retake Quiz
            </Link>
          </Button>
        </div>

        {/* Matches Grid */}
        {matchedListings.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-[#422525]/60">No matches found. Try adjusting your preferences.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchedListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}