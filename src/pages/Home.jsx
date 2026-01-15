import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/landing/HeroSection';
import PropertyCard from '@/components/listings/PropertyCard';
import ListingsGrid from '@/components/landing/ListingsGrid';
import ListingsMap from '@/components/landing/ListingsMap';
import ValueProposition from '@/components/landing/ValueProposition';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, Map } from 'lucide-react';

// Mock Featured Listings with different badge combinations
const MOCK_FEATURED_LISTINGS = [
  {
    id: 'mock-1',
    title: 'דירת גן מעוצבת בפלורנטין',
    city: 'תל אביב',
    neighborhood: 'פלורנטין',
    pricePerNight: 450,
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    vibeTags: ['VEGAN', 'QUIET', 'CLEAN'],
    matchScore: 94,
    has360Tour: true,
    isVerifiedByAmbo: true
  },
  {
    id: 'mock-2',
    title: 'לופט מודרני בנווה צדק',
    city: 'תל אביב',
    neighborhood: 'נווה צדק',
    pricePerNight: 580,
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    vibeTags: ['SOCIAL', 'WFH', 'PARTY_LOVER'],
    matchScore: 87,
    has360Tour: false,
    isVerifiedByAmbo: true
  },
  {
    id: 'mock-3',
    title: 'דירה עם נוף לים',
    city: 'תל אביב',
    neighborhood: 'הצפון הישן',
    pricePerNight: 520,
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    vibeTags: ['QUIET', 'SPIRITUAL', 'FLOWING'],
    matchScore: 91,
    has360Tour: true,
    isVerifiedByAmbo: false
  },
  {
    id: 'mock-4',
    title: 'סטודיו נעים ליד שוק הכרמל',
    city: 'תל אביב',
    neighborhood: 'כרמל',
    pricePerNight: 320,
    photos: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800'],
    vibeTags: ['STUDENT_VIBE', 'WFH', 'SOCIAL'],
    has360Tour: false,
    isVerifiedByAmbo: false
  }
];

export default function Home() {
  const [searchFilters, setSearchFilters] = React.useState({ location: '', budget: null });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const allListings = await base44.entities.Listing.list();
      return allListings.filter(listing => listing.status !== 'ARCHIVED');
    }
  });

  // Listen for search updates from navbar
  React.useEffect(() => {
    const handleSearchUpdate = (event) => {
      setSearchFilters(event.detail);
    };
    
    window.addEventListener('searchUpdated', handleSearchUpdate);
    return () => window.removeEventListener('searchUpdated', handleSearchUpdate);
  }, []);

  // Mix real listings with mock data for discovery feed
  const allListings = [...listings, ...MOCK_FEATURED_LISTINGS];

  // Apply filters
  const filteredListings = allListings.filter(listing => {
    // Location filter (city or neighborhood)
    if (searchFilters.location) {
      const locationLower = searchFilters.location.toLowerCase();
      const cityMatch = listing.city?.toLowerCase().includes(locationLower);
      const neighborhoodMatch = listing.neighborhood?.toLowerCase().includes(locationLower);
      if (!cityMatch && !neighborhoodMatch) return false;
    }

    // Budget filter
    if (searchFilters.budget && listing.pricePerNight > searchFilters.budget) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      <HeroSection />

      {/* Discovery Feed Section */}
      <section className="relative py-20 bg-[#FDFCF8]">
        {/* Subtle Gradient Mesh Overlay at Top */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#F4CBB2]/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#E6DDD0]/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 
              className="text-4xl font-bold text-[#4A2525] mb-4"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              Discover Properties
            </h2>
            <p className="text-lg text-[#4A2525]/70">
              Explore all available listings
            </p>
          </div>

          {/* Tabs for Grid/Map View */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                <span>Grid View</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                <span>Map View</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              {/* Property Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <p className="text-2xl text-[#4A2525]/60">No properties found matching your filters</p>
                    <p className="text-sm text-[#4A2525]/40 mt-2">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="map">
              <ListingsMap listings={filteredListings} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <ValueProposition />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}