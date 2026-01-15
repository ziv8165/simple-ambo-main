import React from 'react';
import { Wifi, Tv, Wind, Flame, WashingMachine, Car, Waves } from 'lucide-react';

const AMENITIES = {
  internet: [
    { key: 'WIFI', label: 'Wi-Fi', icon: Wifi },
    { key: 'DEDICATED_WORKSPACE', label: 'עמדת עבודה ייעודית', icon: Wifi }
  ],
  heating_cooling: [
    { key: 'AC', label: 'מיזוג אוויר', icon: Wind },
    { key: 'HEATING_CENTRAL', label: 'חימום מרכזי', icon: Flame }
  ],
  bedroom_laundry: [
    { key: 'WASHER', label: 'מכונת כביסה', icon: WashingMachine },
    { key: 'DRYER', label: 'מייבש כביסה', icon: Wind }
  ],
  location: [
    { key: 'PRIVATE_PATIO_BALCONY', label: 'מרפסת פרטית', icon: Waves }
  ]
};

export default function AmenitiesStep({ data, updateData, adminFeedback = {} }) {
  const toggleAmenity = (category, key) => {
    const current = data.amenities_categorized || {};
    const categoryItems = current[category] || [];
    
    const newCategoryItems = categoryItems.includes(key)
      ? categoryItems.filter(item => item !== key)
      : [...categoryItems, key];
    
    updateData({
      amenities_categorized: {
        ...current,
        [category]: newCategoryItems
      }
    });
  };

  const isSelected = (category, key) => {
    return (data.amenities_categorized?.[category] || []).includes(key);
  };

  const setTvOption = (value) => {
    updateData({ tvOption: value });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        כדאי להוסיף כמה משירותים שלכם להציע
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        תוכלו להוסיף שירותים נוספים לאחר הפרסום, ואחר כך לערוך את הטיפול שלהם.
      </p>

      <div className="space-y-10">
        {/* TV Options - Special Section */}
        <div>
          <h3 className="text-lg font-semibold text-[#4A2525]/60 mb-4">טלוויזיה</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTvOption('NONE')}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.tvOption === 'NONE' || !data.tvOption
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-base font-medium text-[#4A2525]">לא</span>
            </button>
            
            <button
              onClick={() => setTvOption('CABLE')}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.tvOption === 'CABLE'
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-base font-medium text-[#4A2525]">כבלים</span>
            </button>
            
            <button
              onClick={() => setTvOption('SMART')}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.tvOption === 'SMART'
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-base font-medium text-[#4A2525]">חכמה</span>
            </button>
          </div>
        </div>

        {Object.entries(AMENITIES).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-[#4A2525]/60 mb-4">
              {category === 'internet' && 'אינטרנט ועבודה'}
              {category === 'entertainment' && 'בידור'}
              {category === 'heating_cooling' && 'חימום וקירור'}
              {category === 'bedroom_laundry' && 'כביסה'}
              {category === 'location' && 'מרחב חוץ'}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((amenity) => {
                const Icon = amenity.icon;
                const selected = isSelected(category, amenity.key);
                
                return (
                  <button
                    key={amenity.key}
                    onClick={() => toggleAmenity(category, amenity.key)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-right flex items-center gap-3
                      ${selected 
                        ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                        : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 ${selected ? 'text-[#BC5D34]' : 'text-[#4A2525]'}`} />
                    <span className="text-base font-medium text-[#4A2525]">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}