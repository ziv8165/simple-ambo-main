import React, { useState } from 'react';
import { Video, Heart, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FavoriteButton from '@/components/listings/FavoriteButton';
import CompareBar from '@/components/listings/CompareBar';

const sampleListings = [
  {
    id: 1,
    title: "Sunlit Studio in Neve Tzedek",
    location: "Tel Aviv",
    display_price: 3920,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 2,
    title: "Modern Loft with Terrace",
    location: "Florentin",
    display_price: 4480,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    has_video: true,
    bedrooms: 2
  },
  {
    id: 3,
    title: "Cozy Apartment near Beach",
    location: "Jaffa",
    display_price: 3360,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 4,
    title: "Designer Flat in City Center",
    location: "Rothschild",
    display_price: 5600,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    has_video: true,
    bedrooms: 2
  },
  {
    id: 5,
    title: "Charming Garden Apartment",
    location: "Ramat Aviv",
    display_price: 4200,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    has_video: true,
    bedrooms: 3
  },
  {
    id: 6,
    title: "Minimalist White Studio",
    location: "Dizengoff",
    display_price: 3080,
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 7,
    title: "Bohemian Artist Loft",
    location: "South Tel Aviv",
    display_price: 2800,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 8,
    title: "Luxury Penthouse Suite",
    location: "Park Tzameret",
    display_price: 8400,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    has_video: true,
    bedrooms: 3
  },
  // Additional listings for load more
  {
    id: 9,
    title: "Seaside Studio Retreat",
    location: "Herzliya",
    display_price: 4900,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 10,
    title: "Historic Bauhaus Gem",
    location: "White City",
    display_price: 5200,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    has_video: true,
    bedrooms: 2
  },
  {
    id: 11,
    title: "Quiet Garden Hideaway",
    location: "Old North",
    display_price: 3800,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    has_video: true,
    bedrooms: 2
  },
  {
    id: 12,
    title: "Urban Jungle Apartment",
    location: "Kerem Hateimanim",
    display_price: 4100,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 13,
    title: "Executive Suite",
    location: "Sarona",
    display_price: 7500,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    has_video: true,
    bedrooms: 2
  },
  {
    id: 14,
    title: "Rooftop Paradise",
    location: "Givatayim",
    display_price: 4600,
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
    has_video: true,
    bedrooms: 2
  },
  {
    id: 15,
    title: "Compact City Studio",
    location: "Allenby",
    display_price: 2500,
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
    has_video: true,
    bedrooms: 1
  },
  {
    id: 16,
    title: "Family Apartment",
    location: "Ramat Gan",
    display_price: 5100,
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
    has_video: true,
    bedrooms: 3
  }
];

export default function ListingsGrid({ showTitle = true }) {
  const displayedListings = sampleListings.slice(0, 8);
  const [compareList, setCompareList] = useState(() => {
    const stored = localStorage.getItem('compareListings');
    return stored ? JSON.parse(stored) : [];
  });

  const toggleCompare = (listing, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCompareList(prev => {
      const exists = prev.find(l => l.id === listing.id);
      let newList;
      
      if (exists) {
        newList = prev.filter(l => l.id !== listing.id);
      } else {
        if (prev.length >= 4) {
          return prev; // Max 4 listings
        }
        newList = [...prev, listing];
      }
      
      localStorage.setItem('compareListings', JSON.stringify(newList));
      return newList;
    });
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => {
      const newList = prev.filter(l => l.id !== id);
      localStorage.setItem('compareListings', JSON.stringify(newList));
      return newList;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('compareListings');
  };

  const isInCompare = (id) => compareList.some(l => l.id === id);

  return (
    <div>
      {showTitle && (
        <h2 className="text-3xl md:text-4xl font-light text-center text-[#1A1A1A] tracking-tight mb-16">
          Curated Spaces
        </h2>
      )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <AnimatePresence>
            {displayedListings.map((listing, index) => (
              <Link to={createPageUrl('ListingDetails') + '?id=' + listing.id} key={listing.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2.5">
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Video Badge */}
                  {listing.has_video && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs tracking-wide flex items-center gap-1.5">
                      <Video className="w-3 h-3 text-[#422525]" />
                      <span className="text-[#1A1A1A]">Video</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div onClick={(e) => e.preventDefault()}>
                      <FavoriteButton listingId={listing.id} size="small" />
                    </div>
                    <button
                      onClick={(e) => toggleCompare(listing, e)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isInCompare(listing.id)
                          ? 'bg-[#E3C766] text-[#1A1A1A]'
                          : 'bg-white/90 backdrop-blur-sm text-[#422525]'
                      }`}
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#1A1A1A] text-xs tracking-wide truncate pr-4">
                      {listing.title}
                    </h3>
                  </div>
                  <p className="text-[10px] text-[#422525]/60 tracking-wide">{listing.location}</p>
                  <p className="text-xs text-[#1A1A1A]">
                    <span className="font-medium">₪{listing.display_price.toLocaleString()}</span>
                    <span className="text-[#422525]/50 text-[10px]"> total</span>
                  </p>
                </div>
                </motion.div>
                </Link>
                ))}
          </AnimatePresence>
        </div>

      <CompareBar 
        compareList={compareList}
        onRemove={removeFromCompare}
        onClear={clearCompare}
      />
    </div>
  );
}