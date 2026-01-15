import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ban, TrendingDown, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function HostCancellationHandler({ booking, listing, open, onClose }) {
  const queryClient = useQueryClient();

  const cancelAsHostMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Cancel booking with full refund to guest
      await base44.entities.Booking.update(booking.id, {
        status: 'CANCELLED',
        cancelledBy: 'HOST',
        cancelledAt: new Date().toISOString(),
        refundAmount: booking.totalPrice, // Full refund
        hostCancellation: true
      });

      // Step 2: Block the dates in the listing
      const blockedDates = listing.blockedDates || [];
      blockedDates.push({
        start: booking.dates.start,
        end: booking.dates.end,
        reason: 'Host Cancellation Penalty',
        isPermanent: true
      });

      await base44.entities.Listing.update(listing.id, {
        blockedDates
      });

      // Step 3: Increment host cancellation count
      const host = await base44.entities.User.filter({ id: listing.hostId });
      const hostData = host[0];
      const cancellationCount = (hostData.hostCancellationCount || 0) + 1;

      await base44.entities.User.update(listing.hostId, {
        hostCancellationCount: cancellationCount,
        ...(cancellationCount >= 3 && { accountStatus: 'SHADOW_BANNED' })
      });

      // Step 4: Create automated review/note
      await base44.entities.Review.create({
        authorId: 'SYSTEM',
        targetId: listing.hostId,
        bookingId: booking.id,
        listingId: listing.id,
        overallRating: 1,
        publicComment: `The host cancelled this reservation ${Math.ceil((new Date(booking.dates.start) - new Date()) / (1000 * 60 * 60 * 24))} days before arrival.`,
        isPublished: true,
        isSystemGenerated: true,
        submittedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.error('הזמנה בוטלה. סנקציות הופעלו על החשבון.');
      onClose();
    },
    onError: (error) => {
      toast.error('שגיאה בביטול ההזמנה');
      console.error(error);
    }
  });

  if (!booking || !listing) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">
            אזהרה: ביטול מצד מארח
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Critical Warning */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-[#4A2525] mb-2">
                  זוהי הפרת אמון חמורה
                </h3>
                <p className="text-sm text-[#4A2525]/80 leading-relaxed">
                  ביטול הזמנה מאושרת יגרור סנקציות אוטומטיות על החשבון שלך.
                  פעולה זו תפגע ביכולת שלך לארח בעתיד.
                </p>
              </div>
            </div>

            {/* Consequences */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/50 rounded-lg p-4">
                <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#4A2525] mb-1">חסימת יומן</h4>
                  <p className="text-sm text-[#4A2525]/70">
                    התאריכים {new Date(booking.dates.start).toLocaleDateString('he-IL')} - {new Date(booking.dates.end).toLocaleDateString('he-IL')} ינעלו לצמיתות.
                    לא תוכל להשכיר את הנכס בתאריכים אלו.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/50 rounded-lg p-4">
                <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#4A2525] mb-1">פגיעה בחשיפה</h4>
                  <p className="text-sm text-[#4A2525]/70">
                    האלגוריתם יוריד את דירוג המודעה שלך בחיפושים. יותר קשה למצוא אותך.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/50 rounded-lg p-4">
                <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#4A2525] mb-1">הרחקה מהפלטפורמה</h4>
                  <p className="text-sm text-[#4A2525]/70">
                    ביטול שלישי יוביל להקפאה אוטומטית של החשבון.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Info */}
            <div className="mt-6 pt-6 border-t border-red-200">
              <p className="text-sm text-[#4A2525] font-medium">
                האורח יקבל החזר מלא: <span className="text-xl font-bold text-green-600">₪{booking.totalPrice.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              חזור - אל תבטל
            </Button>
            <Button
              onClick={() => cancelAsHostMutation.mutate()}
              disabled={cancelAsHostMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelAsHostMutation.isPending ? 'מבטל...' : 'אני מבין את הסיכונים - בטל הזמנה'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}