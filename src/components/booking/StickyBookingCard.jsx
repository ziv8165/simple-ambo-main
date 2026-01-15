import React, { useState } from 'react';
import { Calendar, ChevronDown, Tag, Flag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import ReportListingModal from '@/components/support/ReportListingModal';

export default function StickyBookingCard({ listing, onBook }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const hasFixedDates = listing.availableFrom && listing.availableTo;
  
  const [checkIn, setCheckIn] = useState(hasFixedDates ? new Date(listing.availableFrom) : null);
  const [checkOut, setCheckOut] = useState(hasFixedDates ? new Date(listing.availableTo) : null);
  const [guests, setGuests] = useState(1);
  const [showCheckInCal, setShowCheckInCal] = useState(false);
  const [showCheckOutCal, setShowCheckOutCal] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * listing.pricePerNight;
  const originalPrice = listing.originalPrice || null;
  const hasDiscount = originalPrice && originalPrice > listing.pricePerNight;

  return (
    <div className="space-y-4">
      {/* Floating Price Tag Notification - Only if discount exists */}
      {hasDiscount && (
        <div className="bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-3">
          <Tag className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-[#4A2525]">
            Lower price than average
          </span>
        </div>
      )}

      {/* Main Booking Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-[#E6DDD0]/50 p-6">
        {/* Price Header */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-1">
            <span 
              className="text-4xl font-bold text-[#4A2525]"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              ₪{listing.pricePerNight?.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-lg text-[#4A2525]/40 line-through">
                ₪{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {nights > 0 && (
            <p className="text-sm text-[#4A2525]/60">
              Total for {nights} nights
            </p>
          )}
        </div>

        {/* Input Group - Single Border Container */}
        <div className="border-2 border-[#4A2525] rounded-2xl overflow-hidden mb-4">
          {/* Upper Half - Check-in & Check-out */}
          <div className="grid grid-cols-2">
            {/* Check-in */}
            {hasFixedDates ? (
              <div className="text-left px-4 py-3 border-r border-[#4A2525]/30 bg-[#FDFCF8]/50">
                <div className="text-xs font-semibold text-[#4A2525] mb-1">CHECK-IN</div>
                <div className="text-sm text-[#4A2525]">
                  {format(checkIn, 'dd.MM.yyyy')}
                </div>
              </div>
            ) : (
              <Popover open={showCheckInCal} onOpenChange={setShowCheckInCal}>
                <PopoverTrigger asChild>
                  <button className="text-left px-4 py-3 hover:bg-[#FDFCF8] transition-colors border-r border-[#4A2525]/30">
                    <div className="text-xs font-semibold text-[#4A2525] mb-1">CHECK-IN</div>
                    <div className="text-sm text-[#4A2525]">
                      {checkIn ? format(checkIn, 'dd.MM.yyyy') : 'Add date'}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      setCheckIn(date);
                      setShowCheckInCal(false);
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Check-out */}
            {hasFixedDates ? (
              <div className="text-left px-4 py-3 bg-[#FDFCF8]/50">
                <div className="text-xs font-semibold text-[#4A2525] mb-1">CHECK-OUT</div>
                <div className="text-sm text-[#4A2525]">
                  {format(checkOut, 'dd.MM.yyyy')}
                </div>
              </div>
            ) : (
              <Popover open={showCheckOutCal} onOpenChange={setShowCheckOutCal}>
                <PopoverTrigger asChild>
                  <button className="text-left px-4 py-3 hover:bg-[#FDFCF8] transition-colors">
                    <div className="text-xs font-semibold text-[#4A2525] mb-1">CHECK-OUT</div>
                    <div className="text-sm text-[#4A2525]">
                      {checkOut ? format(checkOut, 'dd.MM.yyyy') : 'Add date'}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => {
                      setCheckOut(date);
                      setShowCheckOutCal(false);
                    }}
                    disabled={(date) => date < (checkIn || new Date())}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-[#4A2525]/30" />

          {/* Lower Half - Guests */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full text-left px-4 py-3 hover:bg-[#FDFCF8] transition-colors flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#4A2525] mb-1">GUESTS</div>
                  <div className="text-sm text-[#4A2525]">{guests} Guest{guests > 1 ? 's' : ''}</div>
                </div>
                <ChevronDown className="w-5 h-5 text-[#4A2525]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#4A2525]">Guests</div>
                    <div className="text-sm text-[#4A2525]/60">Maximum 4</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border-2 border-[#4A2525] flex items-center justify-center hover:bg-[#FDFCF8] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-[#4A2525]">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(4, guests + 1))}
                      className="w-8 h-8 rounded-full border-2 border-[#4A2525] flex items-center justify-center hover:bg-[#FDFCF8] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reserve Button */}
        <Button
          onClick={onBook}
          className="w-full py-6 text-lg font-bold rounded-2xl mb-3"
          style={{
            backgroundColor: '#BC5D34',
            color: 'white',
            fontFamily: 'League Spartan, sans-serif'
          }}
        >
          Reserve
        </Button>

        {/* Footer Text */}
        <p className="text-center text-sm text-[#4A2525]/60">
          You won't be charged yet
        </p>
      </div>

      {/* Report Link */}
      <button 
        onClick={() => setShowReportModal(true)}
        className="flex items-center justify-center gap-2 w-full py-3 text-sm text-[#4A2525]/70 hover:text-[#4A2525] transition-colors"
      >
        <Flag className="w-4 h-4" />
        <span className="underline">Report this listing</span>
      </button>

      {/* Report Modal */}
      <ReportListingModal
        listing={listing}
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}