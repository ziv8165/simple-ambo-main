import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function LiabilityWaiverModal({ open, onClose, bookingId, onReturnToInstantBook }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAcceptAndSearch = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('acceptLiabilityWaiver', { bookingId });
      
      if (response.data.success) {
        toast.success('הבנו את הבקשה שלך');
        onClose();
        navigate(createPageUrl('Home'));
      } else {
        toast.error('שגיאה בעדכון');
      }
    } catch (error) {
      toast.error('שגיאה בשרת');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToOffers = () => {
    onClose();
    if (onReturnToInstantBook) {
      onReturnToInstantBook();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#4A2525]">
              שימו לב ⚠️
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-[#4A2525] leading-relaxed">
            הדירות שהצגנו לכם כעת עברו בדיקה מיוחדת והן מוכנות לכניסה מיידית.
          </p>

          <div className="bg-orange-50 rounded-xl p-4 space-y-2">
            <p className="text-[#4A2525] font-medium">במעבר לחיפוש עצמאי:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#4A2525]/80">
              <li>הדירות כפופות לזמני אישור רגילים.</li>
              <li>ייתכן שהמארחים אינם זמינים כרגע.</li>
              <li>האחריות על תיאום שעת הכניסה עוברת אליכם.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleAcceptAndSearch}
              disabled={isLoading}
              className="w-full bg-[#4A2525] hover:bg-[#4A2525]/90 text-white"
            >
              הבנתי, קח אותי לדף הבית
            </Button>

            <Button
              onClick={handleReturnToOffers}
              variant="outline"
              className="w-full border-[#4A2525] text-[#4A2525] hover:bg-[#4A2525]/5"
            >
              תציג לי שוב את ההצעות שלך
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}