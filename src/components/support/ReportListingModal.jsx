import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, X, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const MAIN_REASONS = [
  { value: 'INACCURATE', label: "It's inaccurate or incorrect" },
  { value: 'SCAM', label: "It's a scam / It's not a real place" },
  { value: 'OFFENSIVE', label: "It's offensive or abusive" },
  { value: 'OTHER', label: 'Something else' }
];

const SUB_REASONS = {
  INACCURATE: [
    { value: 'NOT_REAL', label: 'Not a real place' },
    { value: 'INACCURATE_DESC', label: 'Inaccurate description' },
    { value: 'DUPLICATE', label: 'Duplicate listing' }
  ],
  SCAM: [
    { value: 'PAY_OUTSIDE', label: 'Host asked to pay outside the app', critical: true },
    { value: 'PRIVATE_INFO', label: 'Host shared private info' },
    { value: 'PROMOTING_WEBSITES', label: 'Promoting other websites' }
  ],
  OFFENSIVE: [
    { value: 'HATE_SPEECH', label: 'Hate speech or discrimination' },
    { value: 'BULLYING', label: 'Bullying or harassment' },
    { value: 'VIOLENT_CONTENT', label: 'Violent or graphic content' }
  ]
};

export default function ReportListingModal({ listing, open, onClose }) {
  const [step, setStep] = useState(1);
  const [mainReason, setMainReason] = useState('');
  const [subReason, setSubReason] = useState('');
  const [details, setDetails] = useState('');

  const submitReportMutation = useMutation({
    mutationFn: async () => {
      // Here you would create a Report entity
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setStep(4);
      toast.success('Report submitted successfully');
    }
  });

  const handleMainReasonSelect = (value) => {
    setMainReason(value);
    if (value === 'OTHER') {
      setStep(3); // Go directly to details
    } else {
      setStep(2); // Go to sub-reasons
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSubReason('');
    } else if (step === 3) {
      if (mainReason === 'OTHER') {
        setStep(1);
      } else {
        setStep(2);
      }
      setDetails('');
    }
  };

  const handleClose = () => {
    setStep(1);
    setMainReason('');
    setSubReason('');
    setDetails('');
    onClose();
  };

  const getStepTitle = () => {
    if (step === 1) return 'Why are you reporting this listing?';
    if (step === 2) {
      if (mainReason === 'INACCURATE') return "Why is this inaccurate?";
      if (mainReason === 'SCAM') return "Why do you think this is a scam?";
      if (mainReason === 'OFFENSIVE') return "Why are you reporting this?";
    }
    if (step === 3) return mainReason === 'INACCURATE' ? 'Describe the inaccuracy' : 'Describe what happened';
    if (step === 4) return 'We received your report';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-[#FDFCF8] rounded-3xl" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {step > 1 && step < 4 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-[#4A2525] hover:text-[#BC5D34] p-0 h-auto"
              >
                <ChevronRight className="w-5 h-5" />
                Back
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold text-[#4A2525] flex-1 text-center">
              {getStepTitle()}
            </DialogTitle>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="p-0 h-auto hover:bg-transparent"
            >
              <X className="w-5 h-5 text-[#4A2525]" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Main Reason */}
          {step === 1 && (
            <RadioGroup value={mainReason} onValueChange={handleMainReasonSelect}>
              <div className="space-y-4">
                {MAIN_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    className="flex items-center space-x-3 space-x-reverse border-b border-[#E6DDD0] pb-4"
                  >
                    <RadioGroupItem
                      value={reason.value}
                      id={reason.value}
                      className="border-2 border-[#4A2525] data-[state=checked]:bg-[#BC5D34] data-[state=checked]:border-[#BC5D34]"
                    />
                    <Label
                      htmlFor={reason.value}
                      className="text-base text-[#4A2525] cursor-pointer flex-1 text-right"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Sub Reasons */}
          {step === 2 && SUB_REASONS[mainReason] && (
            <>
              <RadioGroup value={subReason} onValueChange={setSubReason}>
                <div className="space-y-4">
                  {SUB_REASONS[mainReason].map((reason) => (
                    <div
                      key={reason.value}
                      className="flex items-center space-x-3 space-x-reverse border-b border-[#E6DDD0] pb-4"
                    >
                      <RadioGroupItem
                        value={reason.value}
                        id={reason.value}
                        className="border-2 border-[#4A2525] data-[state=checked]:bg-[#BC5D34] data-[state=checked]:border-[#BC5D34]"
                      />
                      <Label
                        htmlFor={reason.value}
                        className="text-base text-[#4A2525] cursor-pointer flex-1 text-right"
                      >
                        {reason.label}
                        {reason.critical && (
                          <span className="block text-sm text-red-600 mt-1">
                            Example: The host requested direct payment to account, cash, etc.
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setStep(3)}
                  disabled={!subReason}
                  className="px-8 py-6 text-base font-bold rounded-full bg-[#4A2525] hover:bg-[#BC5D34] text-white"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide specific details..."
                className="min-h-[200px] text-base border-2 border-[#4A2525] rounded-xl focus:border-[#BC5D34] resize-none"
              />

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => submitReportMutation.mutate()}
                  disabled={!details.trim() || submitReportMutation.isPending}
                  className="px-8 py-6 text-base font-bold rounded-full bg-[#4A2525] hover:bg-[#BC5D34] text-white"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  {submitReportMutation.isPending ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg text-[#4A2525] mb-8">
                Thanks for looking out for our community. We will review this shortly.
              </p>
              <Button
                onClick={handleClose}
                className="px-8 py-6 text-base font-bold rounded-full bg-[#4A2525] hover:bg-[#BC5D34] text-white"
                style={{ fontFamily: 'League Spartan, sans-serif' }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}