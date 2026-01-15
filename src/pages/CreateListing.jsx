import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

// Step Components
import PropertyTypeStep from '@/components/wizard/PropertyTypeStep';
import LocationStep from '@/components/wizard/LocationStep';
import BasicsStep from '@/components/wizard/BasicsStep';
import VibeStep from '@/components/wizard/VibeStep';
import SafetyRulesStep from '@/components/wizard/SafetyRulesStep';
import AmenitiesStep from '@/components/wizard/AmenitiesStep';
import PhotosStep from '@/components/wizard/PhotosStep';
import DetailsStep from '@/components/wizard/DetailsStep';
import PricingStep from '@/components/wizard/PricingStep';
import CancellationPolicyStep from '@/components/wizard/CancellationPolicyStep';

const TOTAL_STEPS = 10;

export default function CreateListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('id');
  const isAdminMode = searchParams.get('adminMode') === 'true';
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [listingData, setListingData] = useState({
    type: '',
    city: '',
    neighborhood: '',
    realAddress: '',
    displayLocation: null,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    guests: 4,
    vibeTags: [],
    smokingPolicy: 'PROHIBITED',
    petsAllowed: false,
    security: { hasMamad: false, hasBars: false },
    waterHeating: 'SOLAR',
    amenities_categorized: {},
    photos: [],
    photo360: '',
    title: '',
    summary: '',
    the_space: '',
    pricePerNight: 0,
    availableFrom: '',
    availableTo: '',
    cancellationPolicy: 'MODERATE'
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingListing, isLoading: loadingListing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  useEffect(() => {
    if (existingListing) {
      setListingData(existingListing);
    }
  }, [existingListing]);

  const updateData = (newData) => {
    setListingData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (listingId) {
        return base44.entities.Listing.update(listingId, data);
      } else {
        return base44.entities.Listing.create(data);
      }
    },
    onSuccess: () => {
      if (isAdminMode) {
        toast.success('המודעה עודכנה בהצלחה');
        navigate(createPageUrl('AdminDashboard'));
      } else {
        toast.success(listingId ? 'המודעה עודכנה ונשלחה לבדיקה מחדש' : 'המודעה נוצרה בהצלחה');
        navigate(createPageUrl('HostDashboard'));
      }
    },
    onError: (error) => {
      toast.error('שגיאה בשמירת המודעה');
      console.error('Failed to save listing:', error);
    }
  });

  const handleSubmit = async () => {
    const submitData = { ...listingData };

    if (isAdminMode) {
      // מצב מנהל: שומר שינויים ללא שינוי סטטוס
      // לא משנה את הסטטוס, לא מנקה פידבק
    } else {
      // מצב משתמש רגיל: שולח לבדיקה
      submitData.status = 'PENDING_REVIEW';
      submitData.submittedAt = new Date().toISOString();
      submitData.admin_feedback = [];
      submitData.admin_section_feedback = {};
      
      if (!listingId) {
        submitData.hostId = user.id;
      }
    }

    updateMutation.mutate(submitData);
  };

  const handleCancel = () => {
    navigate(isAdminMode ? createPageUrl('AdminDashboard') : createPageUrl('HostDashboard'));
  };

  const steps = [
    { component: PropertyTypeStep, title: 'Which of these best describes your place?' },
    { component: LocationStep, title: 'Where\'s your place located?' },
    { component: BasicsStep, title: 'Share some basics about your place' },
    { component: VibeStep, title: 'What\'s the vibe of your place?' },
    { component: SafetyRulesStep, title: 'House Rules & Safety' },
    { component: AmenitiesStep, title: 'What amenities do you offer?' },
    { component: PhotosStep, title: 'Add photos of your place' },
    { component: DetailsStep, title: 'Now, let\'s give your place a title' },
    { component: PricingStep, title: 'Set your fair price' },
    { component: CancellationPolicyStep, title: 'Choose your cancellation policy' }
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / TOTAL_STEPS) * 100;

  if (loadingListing) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-[#4A2525]">טוען...</div>
      </div>
    );
  }

  const isEditMode = !!listingId;
  const adminFeedback = existingListing?.admin_section_feedback || {};

  // במצב מנהל - תצוגת טאבים
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Admin Mode Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-bold">Admin Editing Mode</span>
              <span className="text-purple-200">•</span>
              <span className="text-purple-100">Listing #{existingListing?.short_id || listingId}</span>
            </div>
            <button
              onClick={handleCancel}
              className="text-sm text-purple-100 hover:text-white underline"
            >
              חזור למנהל
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx + 1)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    currentStep === idx + 1
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <CurrentStepComponent
            data={listingData}
            updateData={updateData}
            adminFeedback={adminFeedback}
            isEditMode={isEditMode}
            isAdminMode={isAdminMode}
          />
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              בטל שינויים
            </button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
            >
              {updateMutation.isPending ? 'שומר...' : '💾 שמור שינויים ועדכן בלייב'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // מצב משתמש רגיל - Wizard
  return (
    <div className="min-h-screen bg-[#FDFCF8]" dir="rtl">
      {/* Split Screen Layout */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  data={listingData}
                  updateData={updateData}
                  adminFeedback={adminFeedback}
                  isEditMode={isEditMode}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-[#E6DDD0]">
            {/* Progress Bar */}
            <div className="h-1 bg-[#E6DDD0]">
              <motion.div
                className="h-full bg-[#BC5D34]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="px-6 md:px-12 py-6 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="text-[#4A2525] underline hover:text-[#BC5D34] transition-colors disabled:opacity-50"
                disabled={currentStep === 1}
              >
                Back
              </button>

              <Button
                onClick={handleNext}
                disabled={updateMutation.isPending}
                className="px-8 py-6 text-lg font-bold rounded-full"
                style={{
                  backgroundColor: '#BC5D34',
                  color: 'white',
                  fontFamily: 'League Spartan, sans-serif'
                }}
              >
                {updateMutation.isPending ? 'שומר...' : (currentStep === TOTAL_STEPS ? (isEditMode ? 'שלח לבדיקה מחדש' : 'Publish') : 'Next')}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Contextual Background */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#F4CBB2]/30 via-[#E6DDD0]/40 to-[#BC5D34]/20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#BC5D34]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#E6DDD0]/30 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          {/* Contextual Tips */}
          <div className="relative z-10 flex items-center justify-center p-12">
            <div className="text-center">
              <h2 
                className="text-4xl font-bold text-[#4A2525] mb-4"
                style={{ fontFamily: 'League Spartan, sans-serif' }}
              >
                Step {currentStep} of {TOTAL_STEPS}
              </h2>
              <p className="text-lg text-[#4A2525]/70 max-w-md">
                {steps[currentStep - 1].title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}