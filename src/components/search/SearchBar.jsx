import React, { useState } from 'react';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';

export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [budget, setBudget] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSearch = () => {
    onSearch({
      location,
      dateRange,
      budget: budget ? parseInt(budget) : null
    });
  };

  return (
    <>
      {/* Desktop Search Pill */}
      <div className="hidden md:flex items-center bg-white rounded-full shadow-lg border border-[#4A2525]/20 overflow-hidden">
        {/* Where */}
        <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
          <MapPin className="w-4 h-4 text-[#4A2525]/60" />
          <input
            type="text"
            placeholder="Where?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#4A2525] placeholder:text-[#4A2525]/60 w-24"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#4A2525]/20" />

        {/* When */}
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
              <Calendar className="w-4 h-4 text-[#4A2525]/60" />
              <span className="text-sm text-[#4A2525]/60">
                {dateRange.from && dateRange.to
                  ? `${dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'When?'}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="w-px h-6 bg-[#4A2525]/20" />

        {/* Budget */}
        <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
          <DollarSign className="w-4 h-4 text-[#4A2525]/60" />
          <input
            type="number"
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#4A2525] placeholder:text-[#4A2525]/60 w-20"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-10 h-10 rounded-full flex items-center justify-center m-1 transition-all hover:scale-105"
          style={{ backgroundColor: '#BC5D34' }}
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Mobile Search Icon */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="md:hidden w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-[#4A2525]/20">
            <Search className="w-5 h-5 text-[#4A2525]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="center">
          <div className="space-y-4">
            {/* Location */}
            <div>
              <label className="text-xs font-medium text-[#4A2525] mb-1 block">Where?</label>
              <div className="flex items-center gap-2 border border-[#E6DDD0] rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-[#4A2525]/60" />
                <Input
                  type="text"
                  placeholder="City or neighborhood"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-none p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="text-xs font-medium text-[#4A2525] mb-1 block">When?</label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 border border-[#E6DDD0] rounded-lg px-3 py-2 cursor-pointer">
                    <Calendar className="w-4 h-4 text-[#4A2525]/60" />
                    <span className="text-sm text-[#4A2525]">
                      {dateRange.from && dateRange.to
                        ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                        : 'Select dates'}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-medium text-[#4A2525] mb-1 block">Budget</label>
              <div className="flex items-center gap-2 border border-[#E6DDD0] rounded-lg px-3 py-2">
                <DollarSign className="w-4 h-4 text-[#4A2525]/60" />
                <Input
                  type="number"
                  placeholder="Max price per night"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="border-none p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full py-6 text-lg font-bold rounded-lg"
              style={{ 
                backgroundColor: '#BC5D34',
                fontFamily: 'League Spartan, sans-serif',
                color: 'white'
              }}
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}