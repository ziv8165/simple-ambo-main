import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const TAG_LABELS = {
  VEGAN: 'טבעוני',
  QUIET: 'שקט ורגוע',
  SOCIAL: 'חברתי ומארח',
  WFH: 'עובדים מהבית',
  CLEAN: 'נקי ומסודר',
  STUDENT_VIBE: 'אווירת סטודנטים',
  SPIRITUAL: 'רוחני',
  FLOWING: 'זורם',
  PARTY_LOVER: 'אוהב מסיבות',
  NEAR_TRAIN: 'רכבת/רק"ל',
  NEAR_BUS: 'תחב"צ נגישה',
  NEAR_SUPER: 'סופר/מכולת',
  NEAR_GYM: 'חדר כושר/ספורט',
  NEAR_NIGHTLIFE: 'חיי לילה/ברים',
  NEAR_PARK: 'פארק/גינה',
  NEAR_SEA: 'מרחק הליכה לים',
  NEAR_COFFEE: 'בתי קפה',
  NEAR_HEALTH: 'שירותי רפואה'
};

const VIBE_TAGS = [
  { key: 'VEGAN', emoji: '🌱' },
  { key: 'QUIET', emoji: '🤫' },
  { key: 'SOCIAL', emoji: '🎉' },
  { key: 'WFH', emoji: '💻' },
  { key: 'CLEAN', emoji: '✨' },
  { key: 'STUDENT_VIBE', emoji: '📚' },
  { key: 'SPIRITUAL', emoji: '🧘' },
  { key: 'FLOWING', emoji: '🌊' },
  { key: 'PARTY_LOVER', emoji: '🥳' }
];

const PROXIMITY_TAGS = [
  { key: 'NEAR_TRAIN', emoji: '🚂' },
  { key: 'NEAR_BUS', emoji: '🚌' },
  { key: 'NEAR_SUPER', emoji: '🛒' },
  { key: 'NEAR_GYM', emoji: '🏋️' },
  { key: 'NEAR_NIGHTLIFE', emoji: '🍺' },
  { key: 'NEAR_PARK', emoji: '🌳' },
  { key: 'NEAR_SEA', emoji: '🌊' },
  { key: 'NEAR_COFFEE', emoji: '☕' },
  { key: 'NEAR_HEALTH', emoji: '🏥' }
];

const CITIES = ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'אילת'];

export default function MatchingQuiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingPrefs } = useQuery({
    queryKey: ['userMatchPreferences', user?.id],
    queryFn: () => base44.entities.UserMatchPreferences.filter({ userId: user.id }),
    enabled: !!user?.id,
    select: (data) => data?.[0]
  });

  const [formData, setFormData] = useState({
    wantedCity: existingPrefs?.wantedCity || 'תל אביב',
    vibeTags: existingPrefs?.vibeTags || [],
    proximityTags: existingPrefs?.proximityTags || [],
    hasPet: existingPrefs?.hasPet || false,
    isNonSmoker: existingPrefs?.isNonSmoker || false
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingPrefs) {
        return base44.entities.UserMatchPreferences.update(existingPrefs.id, {
          ...data,
          hasCompletedQuiz: true
        });
      } else {
        return base44.entities.UserMatchPreferences.create({
          userId: user.id,
          ...data,
          hasCompletedQuiz: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMatchPreferences'] });
      toast.success('השאלון נשמר בהצלחה!');
      navigate(createPageUrl('MyMatches'));
    }
  });

  const toggleVibeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      vibeTags: prev.vibeTags.includes(tag)
        ? prev.vibeTags.filter((t) => t !== tag)
        : [...prev.vibeTags, tag]
    }));
  };

  const toggleProximityTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      proximityTags: prev.proximityTags.includes(tag)
        ? prev.proximityTags.filter((t) => t !== tag)
        : [...prev.proximityTags, tag]
    }));
  };

  const goToNext = () => {
    if (currentStep < 3) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <p>טוען...</p>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const steps = [
    {
      title: 'באיזו עיר אתה מחפש?',
      subtitle: 'בחר את העיר המועדפת עליך',
      render: () => (
        <div className="grid grid-cols-2 gap-4">
          {CITIES.map((city) => (
            <motion.button
              key={city}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, wantedCity: city })}
              className={`p-6 rounded-2xl text-lg font-medium transition-all ${
                formData.wantedCity === city
                  ? 'bg-[#E3C766] text-[#1A1A1A] shadow-lg'
                  : 'bg-white text-[#422525] border-2 border-[#E6DDD0] hover:border-[#E3C766]'
              }`}
            >
              {formData.wantedCity === city && <Check className="w-5 h-5 mb-2 mx-auto" />}
              {city}
            </motion.button>
          ))}
        </div>
      )
    },
    {
      title: "מה הווייב שלך?",
      subtitle: 'בחר עד 3 תכונות שמתארות את אורח החיים שלך',
      render: () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VIBE_TAGS.map((tag) => (
            <motion.button
              key={tag.key}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleVibeTag(tag.key)}
              className={`p-4 rounded-2xl text-center font-medium transition-all ${
                formData.vibeTags.includes(tag.key)
                  ? 'bg-[#E3C766] text-[#1A1A1A] shadow-lg'
                  : 'bg-white text-[#422525] border-2 border-[#E6DDD0] hover:border-[#E3C766]'
              }`}
            >
              <div className="text-3xl mb-2">{tag.emoji}</div>
              <div className="text-sm">{TAG_LABELS[tag.key]}</div>
            </motion.button>
          ))}
        </div>
      )
    },
    {
      title: "יש לך חוקי ברזל?",
      subtitle: 'דברים שחשובים לך לגבי הדירה',
      render: () => (
        <div className="space-y-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormData({ ...formData, hasPet: !formData.hasPet })}
            className={`w-full p-6 rounded-2xl text-right font-medium transition-all flex items-center justify-between ${
              formData.hasPet
                ? 'bg-[#E3C766] text-[#1A1A1A] shadow-lg'
                : 'bg-white text-[#422525] border-2 border-[#E6DDD0] hover:border-[#E3C766]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐶</span>
              <span className="text-lg">יש לי חיית מחמד</span>
            </div>
            {formData.hasPet && <Check className="w-6 h-6" />}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormData({ ...formData, isNonSmoker: !formData.isNonSmoker })}
            className={`w-full p-6 rounded-2xl text-right font-medium transition-all flex items-center justify-between ${
              formData.isNonSmoker
                ? 'bg-[#E3C766] text-[#1A1A1A] shadow-lg'
                : 'bg-white text-[#422525] border-2 border-[#E6DDD0] hover:border-[#E3C766]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚭</span>
              <span className="text-lg">אני לא מעשן/ת</span>
            </div>
            {formData.isNonSmoker && <Check className="w-6 h-6" />}
          </motion.button>
        </div>
      )
    },
    {
      title: "מה חשוב שיהיה בקרבת מקום?",
      subtitle: 'אופציונלי - בחר מה שחשוב לך',
      render: () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROXIMITY_TAGS.map((tag) => (
            <motion.button
              key={tag.key}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleProximityTag(tag.key)}
              className={`p-4 rounded-2xl text-center font-medium transition-all ${
                formData.proximityTags.includes(tag.key)
                  ? 'bg-[#E3C766] text-[#1A1A1A] shadow-lg'
                  : 'bg-white text-[#422525] border-2 border-[#E6DDD0] hover:border-[#E3C766]'
              }`}
            >
              <div className="text-3xl mb-2">{tag.emoji}</div>
              <div className="text-sm">{TAG_LABELS[tag.key]}</div>
            </motion.button>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E6DDD0]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#E3C766]" />
              <h2 className="text-2xl font-light text-[#1A1A1A]">Find The One</h2>
            </div>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className="p-2 hover:bg-[#E6DDD0] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx <= currentStep ? 'bg-[#E3C766]' : 'bg-[#E6DDD0]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-medium text-[#1A1A1A] mb-2 text-center">
                {steps[currentStep].title}
              </h3>
              <p className="text-[#422525]/70 mb-8 text-center">
                {steps[currentStep].subtitle}
              </p>
              {steps[currentStep].render()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E6DDD0] flex gap-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPrev}
              className="flex-1"
            >
              <ChevronRight className="w-5 h-5 ml-2" />
              חזור
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={goToNext}
              className="flex-1 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
            >
              המשך
              <ChevronLeft className="w-5 h-5 mr-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="flex-1 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
            >
              {saveMutation.isPending ? 'שומר...' : (
                <>
                  <Sparkles className="w-5 h-5 ml-2" />
                  מצא לי התאמה!
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}