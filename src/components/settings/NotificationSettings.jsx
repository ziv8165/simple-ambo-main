import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ userId: user.id });
      return prefs[0] || null;
    },
    enabled: !!user?.id
  });

  const [phoneNumber, setPhoneNumber] = useState(preferences?.phoneNumber || '');

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates) => {
      if (preferences?.id) {
        return await base44.entities.UserPreferences.update(preferences.id, updates);
      } else {
        return await base44.entities.UserPreferences.create({
          userId: user.id,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast.success('ההגדרות עודכנו בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון ההגדרות');
    }
  });

  const handleToggle = (category, key) => {
    const currentValue = preferences?.[category]?.[key] ?? true;
    updatePreferencesMutation.mutate({
      [category]: {
        ...preferences?.[category],
        [key]: !currentValue
      }
    });
  };

  const handleSavePhone = () => {
    updatePreferencesMutation.mutate({ phoneNumber });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#4A2525]">טוען...</p>
      </div>
    );
  }

  const emailSettings = [
    { key: 'bookingConfirmed', label: 'אישור הזמנה', icon: Bell },
    { key: 'checkInReminder', label: 'תזכורת צ\'ק-אין', icon: Bell },
    { key: 'checkOutReminder', label: 'תזכורת צ\'ק-אאוט', icon: Bell },
    { key: 'paymentConfirmed', label: 'אישור תשלום', icon: Bell },
    { key: 'newMessage', label: 'הודעה חדשה', icon: MessageSquare },
    { key: 'sosAlerts', label: 'התראות חירום (SOS)', icon: Bell },
    { key: 'supportTicketUpdates', label: 'עדכוני תמיכה', icon: Bell },
    { key: 'reviewRequest', label: 'בקשת ביקורת', icon: Bell },
    { key: 'hostBookingRequest', label: 'בקשות הזמנה (מארחים)', icon: Bell },
    { key: 'newListings', label: 'דירות חדשות', icon: Bell },
    { key: 'priceDrops', label: 'ירידת מחירים', icon: Bell }
  ];

  const smsSettings = [
    { key: 'sosAlerts', label: 'התראות חירום (SOS)', icon: Smartphone },
    { key: 'checkInReminder', label: 'תזכורת צ\'ק-אין', icon: Smartphone },
    { key: 'urgentMessages', label: 'הודעות דחופות', icon: Smartphone }
  ];

  const pushSettings = [
    { key: 'enabled', label: 'הפעל התראות פוש', icon: Bell },
    { key: 'newMessage', label: 'הודעות חדשות', icon: MessageSquare },
    { key: 'bookingUpdates', label: 'עדכוני הזמנות', icon: Bell },
    { key: 'sosAlerts', label: 'התראות חירום', icon: Bell }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl">התראות במייל</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <setting.icon className="w-4 h-4 text-[#4A2525]/60" />
                <Label className="text-[#4A2525] cursor-pointer">
                  {setting.label}
                </Label>
              </div>
              <Switch
                checked={preferences?.emailNotifications?.[setting.key] ?? true}
                onCheckedChange={() => handleToggle('emailNotifications', setting.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-xl">התראות SMS</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <Label className="text-[#4A2525] mb-2 block">מספר טלפון</Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="05X-XXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                dir="ltr"
              />
              <Button
                onClick={handleSavePhone}
                disabled={updatePreferencesMutation.isPending}
                className="bg-[#BC5D34] hover:bg-[#A04D2A]"
              >
                שמור
              </Button>
            </div>
            <p className="text-xs text-[#4A2525]/60 mt-1">
              נדרש למספר טלפון בתוקף להתראות SMS
            </p>
          </div>

          {smsSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <setting.icon className="w-4 h-4 text-[#4A2525]/60" />
                <Label className="text-[#4A2525] cursor-pointer">
                  {setting.label}
                </Label>
              </div>
              <Switch
                checked={preferences?.smsNotifications?.[setting.key] ?? (setting.key === 'sosAlerts')}
                onCheckedChange={() => handleToggle('smsNotifications', setting.key)}
                disabled={!phoneNumber}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-xl">התראות פוש</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#4A2525]/60 mb-4">
            התראות פוש יופיעו כשהאפליקציה פתוחה בדפדפן
          </p>
          {pushSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <setting.icon className="w-4 h-4 text-[#4A2525]/60" />
                <Label className="text-[#4A2525] cursor-pointer">
                  {setting.label}
                </Label>
              </div>
              <Switch
                checked={preferences?.pushNotifications?.[setting.key] ?? true}
                onCheckedChange={() => handleToggle('pushNotifications', setting.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}