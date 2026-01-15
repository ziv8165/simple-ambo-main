import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, Shield, Eye, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import ImageCarousel from './ImageCarousel';

const VIBE_COLORS = {
  VEGAN: 'bg-green-100 text-green-700',
  QUIET: 'bg-blue-100 text-blue-700',
  SOCIAL: 'bg-purple-100 text-purple-700',
  WFH: 'bg-indigo-100 text-indigo-700',
  CLEAN: 'bg-pink-100 text-pink-700',
  STUDENT_VIBE: 'bg-yellow-100 text-yellow-700',
  SPIRITUAL: 'bg-violet-100 text-violet-700',
  FLOWING: 'bg-cyan-100 text-cyan-700',
  PARTY_LOVER: 'bg-orange-100 text-orange-700'
};

const VIBE_LABELS = {
  VEGAN: 'טבעוני',
  QUIET: 'שקט ורגוע',
  SOCIAL: 'חברתי',
  WFH: 'עבודה מהבית',
  CLEAN: 'נקי ומסודר',
  STUDENT_VIBE: 'אווירת סטודנטים',
  SPIRITUAL: 'רוחני',
  FLOWING: 'זורם',
  PARTY_LOVER: 'אוהב מסיבות'
};

export default function PropertyCard({ listing }) {
  const displayTags = listing.vibeTags?.slice(0, 3) || [];
  const images = listing.photos || ['https://via.placeholder.com/400x300'];

  return (
    <div className="group bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Container with Carousel */}
      <div className="relative h-64 overflow-hidden">
        <ImageCarousel 
          images={images} 
          photo360={listing.photo360}
          title={listing.title || listing.city}
          className="h-64"
          listingId={listing.id}
        />

        {/* Overlay Badges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Right - Match Score */}
          {listing.matchScore && (
            <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg pointer-events-auto">
              <span className="text-[#4A2525] font-bold text-sm">{listing.matchScore}%</span>
            </div>
          )}

          {/* Top Right Below Match - Verified Badge */}
          {listing.isVerifiedByAmbo && (
            <div className="absolute top-14 right-3 bg-white rounded-full px-3 py-1 shadow-lg flex items-center gap-1 pointer-events-auto">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span className="text-[#4A2525] font-medium text-xs">מאומת</span>
            </div>
          )}

          {/* Top Left - Favorite */}
          <div className="absolute top-3 left-3 pointer-events-auto">
            <FavoriteButton listingId={listing.id} size="medium" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5" dir="rtl">
        <Link to={createPageUrl(`ListingDetails?id=${listing.id}`)}>
          <h3 
            className="text-xl font-bold text-[#4A2525] mb-2 hover:text-[#BC5D34] transition-colors"
            style={{ fontFamily: 'League Spartan, sans-serif' }}
          >
            {listing.title || `דירה ב${listing.city}`}
          </h3>
        </Link>

        <p className="text-sm text-[#4A2525]/70 mb-3">
          {listing.neighborhood}, {listing.city}
        </p>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-[#4A2525]">
            ₪{listing.pricePerNight?.toLocaleString()}
          </span>
          <span className="text-sm text-[#4A2525]/60">/ לילה</span>
        </div>

        {/* Vibe Tags - Soft Pastel Capsules */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-medium ${VIBE_COLORS[tag] || 'bg-gray-100 text-gray-700'}`}
              >
                {VIBE_LABELS[tag] || tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}