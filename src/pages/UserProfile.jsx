import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Search, 
  MessageSquare, 
  Bell, 
  Trash2, 
  Edit, 
  Save,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import NotificationSettings from '@/components/settings/NotificationSettings';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UserProfile() {
  const [editingContact, setEditingContact] = useState(false);
  const [contactData, setContactData] = useState({
    phone: '',
    address: ''
  });
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['savedSearches', user?.id],
    queryFn: () => base44.entities.SavedSearch.filter({ userId: user?.id }),
    enabled: !!user
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['chatMessages', user?.id],
    queryFn: async () => {
      const messages = await base44.entities.ChatMessage.list('-timestamp', 50);
      return messages.filter(m => m.senderId === user.id || m.receiverId === user.id);
    },
    enabled: !!user
  });

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ userId: user?.id });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const updateContactMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('הפרטים עודכנו בהצלחה');
      setEditingContact(false);
    }
  });

  const deleteSearchMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success('החיפוש נמחק');
    }
  });

  const toggleSearchNotificationMutation = useMutation({
    mutationFn: ({ id, enabled }) => 
      base44.entities.SavedSearch.update(id, { notificationsEnabled: enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success('ההגדרות עודכנו');
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences) {
        await base44.entities.UserPreferences.update(preferences.id, data);
      } else {
        await base44.entities.UserPreferences.create({
          userId: user.id,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast.success('ההעדפות עודכנו');
    }
  });

  React.useEffect(() => {
    if (user) {
      setContactData({
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
        </div>

        <div className="pb-16 px-6 text-center relative z-10">
          <p className="text-[#4A2525]/60">טוען...</p>
        </div>
      </div>
    );
  }

  const groupedConversations = conversations.reduce((acc, msg) => {
    if (!acc[msg.conversationId]) {
      acc[msg.conversationId] = [];
    }
    acc[msg.conversationId].push(msg);
    return acc;
  }, {});

  const notificationPrefs = preferences?.emailNotifications || {
    newListings: true,
    priceDrops: true,
    messages: true,
    bookingUpdates: true
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-8 h-8 text-[#BC5D34]" />
          <h1 className="text-3xl font-bold text-[#4A2525]" style={{ fontFamily: 'League Spartan, sans-serif' }}>הפרופיל שלי</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#E6DDD0] flex items-center justify-center">
                  <User className="w-8 h-8 text-[#422525]" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">{user?.full_name || 'משתמש'}</p>
                  <p className="text-sm text-[#422525]/60">{user?.email}</p>
                </div>
              </div>

              <Separator />

              {editingContact ? (
                <div className="space-y-3">
                  <div>
                    <Label>טלפון</Label>
                    <Input
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="050-1234567"
                    />
                  </div>
                  <div>
                    <Label>כתובת</Label>
                    <Input
                      value={contactData.address}
                      onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                      placeholder="רחוב, עיר"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateContactMutation.mutate(contactData)}
                      disabled={updateContactMutation.isPending}
                      className="flex-1 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      שמור
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingContact(false)}
                      className="flex-1"
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[#422525]/60" />
                    <span>{user?.phone || 'לא הוזן'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#422525]/60" />
                    <span>{user?.address || 'לא הוזן'}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingContact(true)}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    ערוך פרטים
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="searches" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="searches">
                  <Search className="w-4 h-4 ml-2" />
                  חיפושים שמורים
                </TabsTrigger>
                <TabsTrigger value="messages">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  הודעות
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="w-4 h-4 ml-2" />
                  התראות
                </TabsTrigger>
              </TabsList>

              {/* Saved Searches Tab */}
              <TabsContent value="searches" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>החיפושים השמורים שלי</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {savedSearches.length === 0 ? (
                      <div className="text-center py-8 text-[#422525]/60">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>אין חיפושים שמורים</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedSearches.map(search => (
                          <div key={search.id} className="flex items-start justify-between p-4 bg-[#FDFCF8] rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-medium text-[#1A1A1A] mb-2">{search.name}</h3>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {search.criteria.city && (
                                  <Badge variant="outline">{search.criteria.city}</Badge>
                                )}
                                {search.criteria.minPrice && (
                                  <Badge variant="outline">
                                    ₪{search.criteria.minPrice.toLocaleString()}+
                                  </Badge>
                                )}
                                {search.criteria.bedrooms && (
                                  <Badge variant="outline">
                                    {search.criteria.bedrooms} חדרים
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <Switch
                                  checked={search.notificationsEnabled}
                                  onCheckedChange={(checked) =>
                                    toggleSearchNotificationMutation.mutate({
                                      id: search.id,
                                      enabled: checked
                                    })
                                  }
                                />
                                <span className="text-xs text-[#422525]/70">
                                  קבל התראות על דירות חדשות
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSearchMutation.mutate(search.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>היסטוריית שיחות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(groupedConversations).length === 0 ? (
                      <div className="text-center py-8 text-[#422525]/60">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>אין הודעות</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(groupedConversations).map(([convId, messages]) => {
                          const lastMessage = messages[messages.length - 1];
                          return (
                            <div key={convId} className="p-4 bg-[#FDFCF8] rounded-lg hover:bg-[#E6DDD0]/30 transition-colors cursor-pointer">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-[#1A1A1A]">שיחה #{convId.slice(0, 8)}</h3>
                                <Badge>{messages.length} הודעות</Badge>
                              </div>
                              <p className="text-sm text-[#422525]/70 line-clamp-2">
                                {lastMessage.message}
                              </p>
                              <p className="text-xs text-[#422525]/50 mt-2">
                                {new Date(lastMessage.timestamp).toLocaleDateString('he-IL')}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <NotificationSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}