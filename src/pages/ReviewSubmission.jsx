import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


const STEPS = [
  { id: 'overall', title: 'איך היה באופן כללי?', field: 'overallRating' },
  { 
    id: 'checkin', 
    title: 'איך עבר הצ\'ק-אין?', 
    field: 'checkInRating',
    tags: ['מארחים תגובתיים', 'הוראות ברורות', 'קל להיכנס אליו', 'צ\'ק-אין גמיש']
  },
  { 
    id: 'cleanliness', 
    title: 'באיזו מידה הנכס היה נקי?', 
    field: 'cleanlinessRating',
    tags: ['נקי במיוחד', 'חדר רחצה מבריק', 'מטבח מצוחצח', 'רהיטים ומצעים נקיים ביותר', 'מסודר']
  },
  { 
    id: 'accuracy', 
    title: 'עד כמה תיאור הנכס היה מדויק?', 
    field: 'accuracyRating',
    tags: ['נראה כמו בתמונות', 'תאם לתיאור', 'כל השירותים נמצאים']
  },
  { 
    id: 'communication', 
    title: 'מה היה טיב התקשורת?', 
    field: 'communicationRating',
    tags: ['תמיד היה מענה', 'תחושה ידידותית', 'הוראות שימושיות', 'נלקחה יוזמה']
  },
  { 
    id: 'location', 
    title: 'מה חשבתם על המיקום?', 
    field: 'locationRating',
    tags: ['מיקום שקט', 'יש פרטיות', 'נוח להסתובב ברגל', 'סביבה יפה', 'מסעדות מצוינות']
  }
];

export default function ReviewSubmission() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewData, setReviewData] = useState({
    overallRating: 0,
    checkInRating: 0,
    cleanlinessRating: 0,
    accuracyRating: 0,
    communicationRating: 0,
    locationRating: 0,
    selectedTags: [],
    publicComment: '',
    privateNoteToHost: ''
  });

  // Mock booking data - in real app, get from URL params or state
  const bookingId = new URLSearchParams(window.location.search).get('bookingId') || 'demo';
  const targetId = new URLSearchParams(window.location.search).get('hostId') || 'demo';

  const submitReviewMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Review.create({
        authorId: user.id,
        targetId: targetId,
        bookingId: bookingId,
        ...data,
        isPublished: false,
        submittedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('הביקורת נשלחה בהצלחה!');
      navigate('/');
    },
    onError: () => {
      toast.error('שגיאה בשליחת הביקורת');
    }
  });

  const currentStepData = STEPS[currentStep];

  const handleRating = (rating) => {
    setReviewData(prev => ({
      ...prev,
      [currentStepData.field]: rating
    }));
  };

  const toggleTag = (tag) => {
    setReviewData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const handleNext = () => {
    if (reviewData[currentStepData.field] === 0) {
      toast.error('אנא בחר דירוג');
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(STEPS.length); // Move to comment step
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (reviewData.overallRating === 0) {
      toast.error('חובה לדרג את החוויה הכללית');
      return;
    }
    submitReviewMutation.mutate(reviewData);
  };

  if (currentStep === STEPS.length) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
        </div>

        <div className="pb-16 px-6 max-w-2xl mx-auto relative z-10">
          <Card>
            <CardHeader>
              <CardTitle>שתף את החוויה שלך</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">תגובה ציבורית (אופציונלי)</label>
                <Textarea
                  placeholder="ספר לאחרים על החוויה שלך..."
                  value={reviewData.publicComment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, publicComment: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">הערה פרטית למארח (אופציונלי)</label>
                <Textarea
                  placeholder="משהו שתרצה שהמארח ידע..."
                  value={reviewData.privateNoteToHost}
                  onChange={(e) => setReviewData(prev => ({ ...prev, privateNoteToHost: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="text-yellow-800">
                  הביקורת שלך תישאר מוסתרת עד שהמארח גם ישלח ביקורת, או עד 14 ימים מסיום השהות.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(STEPS.length - 1)}>
                  חזור
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitReviewMutation.isPending}
                  className="flex-1"
                >
                  {submitReviewMutation.isPending ? 'שולח...' : 'שלח ביקורת'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 px-6 max-w-2xl mx-auto relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full ${
                  idx <= currentStep ? 'bg-[#E3C766]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#422525]/60 text-center">
            שלב {currentStep + 1} מתוך {STEPS.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= reviewData[currentStepData.field]
                        ? 'fill-[#E3C766] text-[#E3C766]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Tags */}
            {currentStepData.tags && reviewData[currentStepData.field] > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">מה בלט במיוחד?</p>
                <div className="flex flex-wrap gap-2">
                  {currentStepData.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant={reviewData.selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-[#E3C766] hover:text-white"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  חזור
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1" disabled={reviewData[currentStepData.field] === 0}>
                המשך
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}