import React from 'react';

const VIBE_OPTIONS = [
  { value: 'VEGAN', label: 'טבעוני', emoji: '🌱' },
  { value: 'QUIET', label: 'שקט ורגוע', emoji: '🤫' },
  { value: 'SOCIAL', label: 'חברתי', emoji: '🥳' },
  { value: 'WFH', label: 'עבודה מהבית', emoji: '💻' },
  { value: 'CLEAN', label: 'נקי ומסודר', emoji: '✨' },
  { value: 'STUDENT_VIBE', label: 'אווירת סטודנטים', emoji: '🎓' },
  { value: 'SPIRITUAL', label: 'רוחני', emoji: '🧘' },
  { value: 'FLOWING', label: 'זורם', emoji: '🌊' },
  { value: 'PARTY_LOVER', label: 'אוהב מסיבות', emoji: '🎉' }
];

export default function VibeStep({ data, updateData, adminFeedback = {} }) {
  const toggleVibe = (value) => {
    const currentVibes = data.vibeTags || [];
    const newVibes = currentVibes.includes(value)
      ? currentVibes.filter(v => v !== value)
      : [...currentVibes, value];
    
    updateData({ vibeTags: newVibes });
  };

  const selectedCount = (data.vibeTags || []).length;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        מה האווירה של הנכס שלכם?
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-2">
        בחרו לפחות 3 תגיות שמתארות את האווירה והסגנון של הנכס.
      </p>

      <p className="text-sm text-[#4A2525]/50 mb-12">
        נבחרו: {selectedCount} / מינימום 3
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {VIBE_OPTIONS.map((vibe) => {
          const isSelected = (data.vibeTags || []).includes(vibe.value);
          
          return (
            <button
              key={vibe.value}
              onClick={() => toggleVibe(vibe.value)}
              className={`
                p-6 rounded-2xl border-2 transition-all hover:scale-105 text-center
                ${isSelected 
                  ? 'border-[#BC5D34] bg-[#BC5D34]/10' 
                  : 'border-[#E6DDD0] hover:border-[#BC5D34]/50'
                }
              `}
            >
              <div className="text-4xl mb-3">{vibe.emoji}</div>
              <span className="text-base font-medium text-[#4A2525]">{vibe.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}