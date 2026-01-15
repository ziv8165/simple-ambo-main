import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CANCELLATION_REASONS = [
  { value: 'CHANGE_OF_PLANS', label: 'Change of plans' },
  { value: 'FOUND_ANOTHER', label: 'Found another place' },
  { value: 'EMERGENCY', label: 'Emergency (Force Majeure)' }
];

function calculateGuestRefund(booking, listing, cancelDate) {
  const checkIn = new Date(booking.dates.start);
  const daysUntilCheckIn = Math.ceil((checkIn - cancelDate) / (1000 * 60 * 60 * 24));
  const totalPaid = booking.totalPrice;
  const policy = listing.cancellationPolicy || 'MODERATE';
  
  let refundPercentage = 0;
  let message = '';

  switch (policy) {
    case 'FLEXIBLE':
      if (daysUntilCheckIn > 1) {
        refundPercentage = 100;
        message = 'Free cancellation - Full refund';
      } else {
        // Charge 1st night, refund the rest
        const nights = Math.ceil((new Date(booking.dates.end) - checkIn) / (1000 * 60 * 60 * 24));
        const pricePerNight = totalPaid / nights;
        const refund = totalPaid - pricePerNight;
        return {
          refundAmount: refund,
          deduction: pricePerNight,
          percentage: (refund / totalPaid) * 100,
          message: 'Charged for 1st night only'
        };
      }
      break;

    case 'MODERATE':
      if (daysUntilCheckIn > 5) {
        refundPercentage = 100;
        message = 'Free cancellation - Full refund';
      } else {
        refundPercentage = 50;
        message = '50% refund - Less than 5 days notice';
      }
      break;

    case 'STRICT':
      if (daysUntilCheckIn > 14) {
        refundPercentage = 100;
        message = 'Free cancellation - Full refund';
      } else if (daysUntilCheckIn >= 7) {
        refundPercentage = 50;
        message = '50% refund - 7-14 days notice';
      } else {
        refundPercentage = 0;
        message = 'No refund - Less than 7 days notice';
      }
      break;
  }

  const refundAmount = (totalPaid * refundPercentage) / 100;
  const deduction = totalPaid - refundAmount;

  return {
    refundAmount,
    deduction,
    percentage: refundPercentage,
    message
  };
}

export default function CancellationModal({ booking, listing, open, onClose }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const queryClient = useQueryClient();

  const cancelDate = new Date();
  const refundCalculation = booking && listing ? calculateGuestRefund(booking, listing, cancelDate) : null;

  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      // Upload proof file if emergency
      let proofUrl = null;
      if (reason === 'EMERGENCY' && proofFile) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: proofFile });
        proofUrl = uploadResult.file_url;
      }

      // Update booking status
      await base44.entities.Booking.update(booking.id, {
        status: 'CANCELLED',
        cancellationReason: reason,
        refundAmount: refundCalculation.refundAmount,
        cancellationProof: proofUrl,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'GUEST'
      });

      // Here you would also trigger refund processing
      // For now, we just update the booking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(`הזמנה בוטלה. החזר: ₪${refundCalculation.refundAmount.toLocaleString()}`);
      onClose();
    },
    onError: (error) => {
      toast.error('שגיאה בביטול ההזמנה');
      console.error(error);
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  if (!booking || !listing || !refundCalculation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#4A2525]">
            ביטול הזמנה
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Reason */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#4A2525] mb-3">
                מה הסיבה לביטול?
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סיבה" />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reason === 'EMERGENCY' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#4A2525] mb-1">מקרה חירום</h4>
                    <p className="text-sm text-[#4A2525]/70">
                      אנא העלה אסמכתא (צו שמונה, אישור רפואי וכו')
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-[#4A2525]">
                    {proofFile ? proofFile.name : 'העלה קובץ (PDF/תמונה)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!reason}
                className="bg-[#BC5D34] hover:bg-[#A04D2A]"
              >
                המשך
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Calculation */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#4A2525] mb-4">
                חישוב החזר - מדיניות {listing.cancellationPolicy === 'FLEXIBLE' ? 'גמישה' : listing.cancellationPolicy === 'MODERATE' ? 'מתונה' : 'נוקשה'}
              </h3>

              <div className="space-y-4">
                {/* Total Paid */}
                <div className="flex justify-between items-center">
                  <span className="text-[#4A2525]/70">סכום ששולם:</span>
                  <span className="text-xl font-bold text-[#4A2525]">
                    ₪{booking.totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Deduction */}
                <div className="flex justify-between items-center">
                  <span className="text-[#4A2525]/70">ניכוי:</span>
                  <span className="text-xl font-bold text-red-600">
                    -₪{refundCalculation.deduction.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-blue-300 my-2"></div>

                {/* Refund Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-[#4A2525] font-semibold">החזר כספי:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₪{refundCalculation.refundAmount.toLocaleString()}
                  </span>
                </div>

                {/* Visual Representation */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 rounded-full overflow-hidden flex-1 bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${refundCalculation.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#4A2525]">
                      {refundCalculation.percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-[#4A2525]/70 text-center">
                    {refundCalculation.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#4A2525]/80">
                    פעולה זו היא סופית ולא ניתנת לביטול. החזר יבוצע תוך 5-7 ימי עסקים.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronRight className="w-4 h-4 ml-2" />
                חזור
              </Button>
              <Button
                onClick={() => cancelBookingMutation.mutate()}
                disabled={cancelBookingMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelBookingMutation.isPending ? 'מבטל...' : `אשר ביטול וקבל החזר ₪${refundCalculation.refundAmount.toLocaleString()}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}