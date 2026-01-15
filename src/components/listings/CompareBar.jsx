import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { X, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareBar({ compareList, onRemove, onClear }) {
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-[#E6DDD0] p-4 max-w-2xl w-full mx-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <GitCompare className="w-5 h-5 text-[#E3C766]" />
            <span className="text-sm font-medium text-[#1A1A1A]">
              נבחרו {compareList.length} דירות להשוואה
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs"
            >
              נקה הכל
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(createPageUrl('CompareListings'))}
              disabled={compareList.length < 2}
              className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
            >
              השווה עכשיו
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto">
          {compareList.map(listing => (
            <div
              key={listing.id}
              className="relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden group"
            >
              <img
                src={listing.photos?.[0] || 'https://via.placeholder.com/150'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemove(listing.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}