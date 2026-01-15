import React from 'react';
import { Home, Building2, Building, Hotel, Warehouse, Castle } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'standard_apt', label: 'דירה', icon: Building2 },
  { value: 'shared_room', label: 'דירת שותפים', icon: Home },
  { value: 'studio', label: 'סטודיו', icon: Building },
  { value: 'luxury_penthouse', label: 'בית פרטי', icon: Hotel }
];

export default function PropertyTypeStep({ data, updateData, adminFeedback = {} }) {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        איזה מהתיאורים הבאים הכי מתאים לנכס שלכם?
      </h1>
      
      <div className="grid grid-cols-2 gap-4 mt-12">
        {PROPERTY_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = data.assetType === type.value;
          
          return (
            <button
              key={type.value}
              onClick={() => updateData({ assetType: type.value })}
              className={`
                p-6 rounded-2xl border-2 transition-all hover:scale-105
                ${isSelected 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <Icon className={`w-12 h-12 mx-auto mb-3 ${isSelected ? 'text-[#BC5D34]' : 'text-[#4A2525]'}`} />
              <span className="text-lg font-medium text-[#4A2525]">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}