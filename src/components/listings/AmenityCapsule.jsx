import React from 'react';

// Color mapping for different amenity categories
const getCategoryColor = (category) => {
  const colorMap = {
    'bathroom': '#5B8DEE', // Blue
    'bedroom_laundry': '#5B8DEE', // Blue
    'entertainment': '#5B8DEE', // Blue
    'internet': '#5B8DEE', // Blue
    'kitchen': '#5B8DEE', // Blue
    'heating_cooling': '#9F5BD9', // Purple
    'location': '#4A2525', // Burgundy
    'home_safety': '#F59E0B', // Orange/Yellow
    'services': '#BC5D34' // Copper
  };
  return colorMap[category] || '#5B8DEE';
};

export default function AmenityCapsule({ icon: Icon, label, category }) {
  const iconColor = getCategoryColor(category);
  
  return (
    <div className="inline-flex items-center gap-3 bg-white rounded-full border border-gray-100 shadow-sm px-4 py-2">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconColor }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span 
        className="text-sm text-[#4A2525]"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        {label}
      </span>
    </div>
  );
}