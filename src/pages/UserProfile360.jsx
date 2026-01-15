import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Mail, Phone, Bell, MessageSquare, Home, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile360() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('id');
  const queryClient = useQueryClient();

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationChannel, setNotificationChannel] = useState('PUSH');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: userId });
      return users[0];
    },
    enabled: !!userId
  });

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences', userId],
    queryFn: async () => {
      const prefs = await base44.entities.UserMatchPreferences.filter({ userId });
      return prefs[0];
    },
    enabled: !!userId
  });

  const { data: notifications } = useQuery({
    queryKey: ['userNotifications', userId],
    queryFn: async () => {
      const logs = await base44.entities.NotificationLog.filter({ userId });
      return logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!userId
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('sendManualNotification', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('ההתראה נשלחה בהצלחה');
      setNotificationModalOpen(false);
      setNotificationTitle('');
      setNotificationContent('');
      queryClient.invalidateQueries(['userNotifications', userId]);
    },
    onError: () => {
      toast.error('שגיאה בשליחת ההתראה');
    }
  });

  const handleSendNotification = () => {
    if (!notificationContent.trim()) {
      toast.error('נא למלא את תוכן ההתראה');
      return;
    }

    sendNotificationMutation.mutate({
      userId,
      channel: notificationChannel,
      title: notificationTitle || 'התראה מהנהלה',
      content: notificationContent
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">משתמש לא נמצא</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
        >
          <span className="text-2xl">←</span>
          <span className="text-sm font-medium">חזור</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.full_name || 'ללא שם'}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button onClick={() => setNotificationModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
            <Bell className="w-4 h-4 ml-2" />
            שלח התראה ידנית
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">שם מלא</label>
                <Input value={user.full_name || ''} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">אימייל</label>
                <Input value={user.email} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">טלפון</label>
                <Input value={user.phone || 'לא צוין'} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">תפקיד</label>
                <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                  {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">תאריך הצטרפות</label>
                <p className="text-gray-600">{new Date(user.created_date).toLocaleDateString('he-IL', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">סה"כ התראות</p>
                    <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ציון אמינות</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Match Preferences */}
        {preferences && preferences.hasCompletedQuiz && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                העדפות התאמה חכמה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">עיר מבוקשת</p>
                  <p className="text-gray-900">{preferences.wantedCity || 'לא צוין'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">טווח תקציב</p>
                  <p className="text-gray-900">
                    {preferences.budgetMin && preferences.budgetMax 
                      ? `₪${preferences.budgetMin} - ₪${preferences.budgetMax}` 
                      : 'לא צוין'}
                  </p>
                </div>
                {preferences.vibeTags && preferences.vibeTags.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">תגיות ווייב</p>
                    <div className="flex flex-wrap gap-2">
                      {preferences.vibeTags.map(tag => (
                        <Badge key={tag} className="bg-purple-100 text-purple-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle>היסטוריית התראות</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notif.type === 'SMART_MATCH' ? 'bg-purple-100' :
                      notif.type === 'BOOKING_REQUEST' ? 'bg-blue-100' :
                      'bg-orange-100'
                    }`}>
                      {notif.type === 'SMART_MATCH' && <Home className="w-5 h-5 text-purple-600" />}
                      {notif.type === 'BOOKING_REQUEST' && <Calendar className="w-5 h-5 text-blue-600" />}
                      {(notif.type === 'ADMIN_MANUAL' || notif.type === 'SYSTEM') && <Bell className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{notif.title}</p>
                        <Badge className="text-xs">
                          {notif.channel === 'PUSH' ? '📱 Push' : notif.channel === 'SMS' ? '💬 SMS' : '📧 Email'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{notif.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_date).toLocaleString('he-IL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">אין התראות</p>
            )}
          </CardContent>
        </Card>

        {/* Send Notification Modal */}
        <Dialog open={notificationModalOpen} onOpenChange={setNotificationModalOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>שליחת התראה ידנית</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">ערוץ שליחה</label>
                <select
                  value={notificationChannel}
                  onChange={(e) => setNotificationChannel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="PUSH">📱 Push Notification</option>
                  <option value="SMS">💬 SMS</option>
                  <option value="EMAIL">📧 Email</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">כותרת (אופציונלי)</label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="כותרת ההתראה"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">תוכן ההתראה</label>
                <Textarea
                  value={notificationContent}
                  onChange={(e) => setNotificationContent(e.target.value)}
                  placeholder="כתוב את תוכן ההתראה כאן..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSendNotification}
                  disabled={sendNotificationMutation.isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {sendNotificationMutation.isPending ? 'שולח...' : 'שלח התראה'}
                </Button>
                <Button
                  onClick={() => setNotificationModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}