import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, X } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';

export default function CalendarAvailability({ listing, showLegend = true }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // Parse blocked dates
  const blockedDates = listing.blockedDates || [];
  
  // Check if a date is blocked
  const isDateBlocked = (date) => {
    const checkDate = startOfDay(date);
    return blockedDates.some(block => {
      const start = startOfDay(parseISO(block.start));
      const end = startOfDay(parseISO(block.end));
      return isWithinInterval(checkDate, { start, end });
    });
  };

  // Get reason for blocked date
  const getBlockedReason = (date) => {
    const checkDate = startOfDay(date);
    const block = blockedDates.find(block => {
      const start = startOfDay(parseISO(block.start));
      const end = startOfDay(parseISO(block.end));
      return isWithinInterval(checkDate, { start, end });
    });
    return block?.reason || 'תאריך חסום';
  };

  // Disable blocked dates
  const disabledDates = (date) => {
    return isDateBlocked(date);
  };

  // Custom day content
  const modifiers = {
    blocked: (date) => isDateBlocked(date),
  };

  const modifiersStyles = {
    blocked: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      textDecoration: 'line-through',
    },
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-[#E6DDD0]/50">
      <h3 className="text-lg font-semibold text-[#4A2525] mb-3 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-[#BC5D34]" />
        <span>Availability</span>
      </h3>
      <div className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={he}
          disabled={disabledDates}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md"
          fromDate={listing.availableFrom ? parseISO(listing.availableFrom) : new Date()}
          toDate={listing.availableTo ? parseISO(listing.availableTo) : undefined}
        />

        {listing.availableFrom && listing.availableTo && (
          <div className="mt-3 text-center">
            <p className="text-xs text-[#422525]/70">
              Available: {format(parseISO(listing.availableFrom), 'MMM d')} - {format(parseISO(listing.availableTo), 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}