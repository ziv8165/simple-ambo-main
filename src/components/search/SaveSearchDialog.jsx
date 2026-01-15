import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SaveSearchDialog({ open, onOpenChange, searchCriteria }) {
  const [name, setName] = useState('');
  const [notifications, setNotifications] = useState(true);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const saveSearchMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.SavedSearch.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success('החיפוש נשמר בהצלחה');
      onOpenChange(false);
      setName('');
    },
    onError: () => {
      toast.error('שגיאה בשמירת החיפוש');
    }
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('אנא הזן שם לחיפוש');
      return;
    }

    saveSearchMutation.mutate({
      userId: user.id,
      name: name.trim(),
      criteria: searchCriteria,
      notificationsEnabled: notifications
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>שמור חיפוש</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="search-name" className="mb-2">שם החיפוש</Label>
            <Input
              id="search-name"
              placeholder="לדוגמה: דירה בתל אביב עם 2 חדרים"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="notifications" className="font-medium">
                קבל התראות
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                נודיע לך על דירות חדשות שמתאימות לחיפוש
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* Search Summary */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">סיכום החיפוש:</p>
            <div className="space-y-1 text-sm text-gray-600">
              {searchCriteria.city && <p>• עיר: {searchCriteria.city}</p>}
              {searchCriteria.bedrooms && <p>• חדרים: {searchCriteria.bedrooms}</p>}
              {(searchCriteria.minPrice > 0 || searchCriteria.maxPrice < 10000) && (
                <p>• מחיר: ₪{searchCriteria.minPrice.toLocaleString()} - ₪{searchCriteria.maxPrice.toLocaleString()}</p>
              )}
              {(searchCriteria.minArea > 0 || searchCriteria.maxArea < 200) && (
                <p>• שטח: {searchCriteria.minArea} - {searchCriteria.maxArea} מ"ר</p>
              )}
              {searchCriteria.amenities?.length > 0 && (
                <p>• מתקנים: {searchCriteria.amenities.length} נבחרו</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={saveSearchMutation.isPending}
            className="flex-1 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
          >
            {saveSearchMutation.isPending ? 'שומר...' : 'שמור חיפוש'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}