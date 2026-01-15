import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function BlockDatesManager({ listing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const updateListingMutation = useMutation({
    mutationFn: (data) => base44.entities.Listing.update(listing.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('התאריכים החסומים עודכנו בהצלחה');
    },
  });

  const handleAddBlockedDates = () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('יש לבחור טווח תאריכים');
      return;
    }

    const newBlock = {
      start: format(dateRange.from, 'yyyy-MM-dd'),
      end: format(dateRange.to, 'yyyy-MM-dd'),
      reason: reason || 'תאריך חסום',
    };

    const updatedBlockedDates = [...(listing.blockedDates || []), newBlock];
    updateListingMutation.mutate({ blockedDates: updatedBlockedDates });
    
    setDateRange({ from: null, to: null });
    setReason('');
    setIsOpen(false);
  };

  const handleRemoveBlock = (index) => {
    const updatedBlockedDates = listing.blockedDates.filter((_, i) => i !== index);
    updateListingMutation.mutate({ blockedDates: updatedBlockedDates });
  };

  return (
    <Card className="border-[#E6DDD0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-right">
            <CalendarDays className="w-5 h-5 text-[#E3C766]" />
            <span>ניהול זמינות</span>
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#E3C766] hover:bg-[#d4b85a]">
                <Plus className="w-4 h-4 mr-2" />
                חסום תאריכים
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">חסימת תאריכים</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-right block mb-2">בחר טווח תאריכים</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={he}
                    className="rounded-md border border-[#E6DDD0] mx-auto"
                    numberOfMonths={2}
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">סיבה (אופציונלי)</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="למשל: משופץ, מוזמן..."
                    className="text-right"
                  />
                </div>
                <Button 
                  onClick={handleAddBlockedDates}
                  className="w-full bg-[#1A1A1A] hover:bg-[#333]"
                  disabled={!dateRange.from || !dateRange.to}
                >
                  שמור חסימה
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {listing.blockedDates && listing.blockedDates.length > 0 ? (
          <div className="space-y-2">
            {listing.blockedDates.map((block, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#E6DDD0]/30 rounded-lg">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveBlock(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-right mr-3">
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {format(parseISO(block.start), 'd/M/yyyy', { locale: he })} - {format(parseISO(block.end), 'd/M/yyyy', { locale: he })}
                  </p>
                  {block.reason && (
                    <p className="text-xs text-[#422525]/70 mt-1">{block.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#422525]/60 text-center py-4">
            אין תאריכים חסומים
          </p>
        )}
      </CardContent>
    </Card>
  );
}