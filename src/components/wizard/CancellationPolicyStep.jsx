import React, { useState } from 'react';
import { Shield, Check, AlertTriangle, Info } from 'lucide-react';

const POLICIES = [
  {
    value: 'FLEXIBLE',
    label: 'גמיש',
    color: 'green',
    icon: '🟢',
    title: 'Flexible',
    description: 'החזר כספי מלא לאורח עד 24 שעות לפני הצ\'ק-אין.',
    suitableFor: 'לדירות מבוקשות שקל למלא מחדש ברגע האחרון.'
  },
  {
    value: 'MODERATE',
    label: 'מתון',
    color: 'yellow',
    icon: '🟡',
    title: 'Moderate',
    badge: 'מומלץ',
    description: 'החזר כספי מלא לאורח עד 5 ימים לפני הצ\'ק-אין.',
    suitableFor: 'האיזון המושלם בין הוגנות לאורח לביטחון שלך.'
  },
  {
    value: 'STRICT',
    label: 'נוקשה',
    color: 'red',
    icon: '🔴',
    title: 'Strict',
    description: 'החזר כספי מלא עד 7 ימים לפני הצ\'ק-אין. לאחר מכן, החזר של 50% בלבד.',
    suitableFor: 'למארחים שחייבים וודאות מוחלטת ולא מוכנים לקחת סיכון.'
  }
];

export default function CancellationPolicyStep({ data, updateData, adminFeedback = {} }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        איזה ביטחון אתה צריך?
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        בחר את מדיניות הביטולים שתחול על האורחים שלך.
      </p>

      <div className="space-y-4 mb-12">
        {POLICIES.map((policy) => {
          const isSelected = data.cancellationPolicy === policy.value;
          
          return (
            <button
              key={policy.value}
              onClick={() => updateData({ cancellationPolicy: policy.value })}
              className={`
                w-full text-right p-6 rounded-2xl border-2 transition-all
                ${isSelected 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/5' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{policy.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-[#4A2525]">{policy.label}</h3>
                      {policy.badge && (
                        <span className="px-3 py-1 bg-[#BC5D34] text-white text-xs font-bold rounded-full">
                          {policy.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#4A2525]/60">{policy.title}</p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-6 h-6 text-[#BC5D34]" />
                )}
              </div>
              
              <p className="text-base text-[#4A2525] mb-3 font-medium">
                {policy.description}
              </p>
              
              <p className="text-sm text-[#4A2525]/70">
                <strong>למי זה מתאים?</strong> {policy.suitableFor}
              </p>
            </button>
          );
        })}
      </div>

      {/* Host Warning */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#4A2525] mb-3">המחוייבות שלך</h3>
            <p className="text-sm text-[#4A2525]/80 mb-4 leading-relaxed">
              ב-Simple Ambo, ביטול מצד מארח הוא הפרת אמון חמורה.
            </p>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-[#BC5D34] hover:text-[#A04D2A] font-medium mb-4"
            >
              <Info className="w-4 h-4" />
              <span>למידע נוסף</span>
            </button>

            {showDetails && (
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <p className="text-sm text-[#4A2525]/80">
                    <strong>חסימת יומן:</strong> לא תוכל לפרסם את הדירה בתאריכים שביטלת.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <p className="text-sm text-[#4A2525]/80">
                    <strong>פגיעה בחשיפה:</strong> האלגוריתם יוריד את הדירוג של המודעה שלך בחיפושים עתידיים.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <p className="text-sm text-[#4A2525]/80">
                    <strong>הרחקה:</strong> לאחר 3 ביטולים, החשבון שלך יוקפא לצמיתות.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-red-200">
              <p className="text-xs text-[#4A2525]/70">
                על ידי המשך, אני מאשר/ת שקראתי והבנתי את מדיניות הביטולים ומתחייב/ת לכבד הזמנות מאושרות.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}