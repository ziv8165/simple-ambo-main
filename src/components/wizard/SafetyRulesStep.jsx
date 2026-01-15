import React from 'react';
import { Shield, Flame, Cigarette, PawPrint } from 'lucide-react';

export default function SafetyRulesStep({ data, updateData, adminFeedback = {} }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        כללי הבית ובטיחות
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        האמת תעזור לנו למצוא התאמות טובות יותר לאורחים.
      </p>

      <div className="space-y-8">
        {/* Smoking Policy */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <Cigarette className="w-6 h-6 text-[#BC5D34]" />
            <h3 className="text-xl font-semibold text-[#4A2525]">עישון</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'PROHIBITED', label: 'אסור' },
              { value: 'BALCONY_ONLY', label: 'מרפסת בלבד' },
              { value: 'ALLOWED', label: 'מותר' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateData({ smokingPolicy: option.value })}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${data.smokingPolicy === option.value 
                    ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                    : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                  }
                `}
              >
                <span className="text-lg font-medium text-[#4A2525]">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pets */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <PawPrint className="w-6 h-6 text-[#BC5D34]" />
            <h3 className="text-xl font-semibold text-[#4A2525]">חיות מחמד</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateData({ petsAllowed: true })}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.petsAllowed 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-lg font-medium text-[#4A2525]">מותר</span>
            </button>
            
            <button
              onClick={() => updateData({ petsAllowed: false })}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${!data.petsAllowed 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-lg font-medium text-[#4A2525]">לא מותר</span>
            </button>
          </div>
        </div>

        {/* Shelter (Mamad) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#BC5D34]" />
            <h3 className="text-xl font-semibold text-[#4A2525]">ממ"ד (מקלט)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateData({ security: { ...data.security, hasMamad: true, mamadLocation: null } })}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.security?.hasMamad 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-lg font-medium text-[#4A2525]">יש</span>
            </button>
            
            <button
              onClick={() => updateData({ security: { ...data.security, hasMamad: false } })}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.security?.hasMamad === false
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-lg font-medium text-[#4A2525]">אין</span>
            </button>
          </div>

          {/* Follow-up question if no Mamad */}
          {data.security?.hasMamad === false && (
            <div className="mt-4 p-4 bg-[#E6DDD0]/20 rounded-xl">
              <p className="text-sm font-medium text-[#4A2525] mb-3">איפה הסביבה שלך יש?</p>
              <p className="text-xs text-[#4A2525]/70 mb-3">
                חשוב לאורחים לדעת היכן הממ"ד הקרוב ביותר למקרה חירום
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateData({ security: { ...data.security, mamadLocation: 'BUILDING' } })}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${data.security?.mamadLocation === 'BUILDING'
                      ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                      : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                    }
                  `}
                >
                  בבניין
                </button>
                <button
                  onClick={() => updateData({ security: { ...data.security, mamadLocation: 'NEARBY' } })}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${data.security?.mamadLocation === 'NEARBY'
                      ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                      : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                    }
                  `}
                >
                  בקרבת מקום
                </button>
                <button
                  onClick={() => updateData({ security: { ...data.security, mamadLocation: 'PUBLIC' } })}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${data.security?.mamadLocation === 'PUBLIC'
                      ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                      : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                    }
                  `}
                >
                  ממ"ד ציבורי
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Water Heating */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-[#BC5D34]" />
            <h3 className="text-xl font-semibold text-[#4A2525]">חימום מים</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateData({ waterHeating: 'SOLAR' })}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.waterHeating === 'SOLAR' 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-lg font-medium text-[#4A2525]">☀️ סולארי</span>
            </button>
            
            <button
              onClick={() => updateData({ waterHeating: 'ELECTRIC' })}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${data.waterHeating === 'ELECTRIC' 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <span className="text-lg font-medium text-[#4A2525]">⚡ חשמלי</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}