import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, MessageSquare, Globe, Settings, Save, AlertCircle,
  Facebook, Instagram, Search, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('email');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      return await base44.entities.SystemSetting.list();
    }
  });

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, category, description }) => {
      const existing = settings.find(s => s.key === key);
      if (existing) {
        return await base44.entities.SystemSetting.update(existing.id, {
          value,
          category,
          description,
          updated_by: user.id
        });
      } else {
        return await base44.entities.SystemSetting.create({
          key,
          value,
          category,
          description,
          updated_by: user.id
        });
      }
    },
    onSuccess: () => {
      toast.success('ההגדרה נשמרה בהצלחה');
      queryClient.invalidateQueries(['systemSettings']);
    }
  });

  const getSetting = (key) => {
    return settings.find(s => s.key === key)?.value || '';
  };

  const SettingField = ({ settingKey, label, description, category, type = 'text', rows = 4 }) => {
    const [value, setValue] = useState(getSetting(settingKey));

    React.useEffect(() => {
      setValue(getSetting(settingKey));
    }, [settings, settingKey]);

    const handleSave = () => {
      saveSettingMutation.mutate({
        key: settingKey,
        value,
        category,
        description: label
      });
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveSettingMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saveSettingMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
        </div>
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={rows}
            className="font-mono text-sm"
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">גישה נדרשת</h2>
            <p className="text-gray-600">רק מנהלי מערכת יכולים לגשת לעמוד זה</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">הגדרות מערכת</h1>
            <p className="text-gray-500">ניהול תבניות, תוכן והגדרות כלליות</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 ml-2" />
              תבניות מייל
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="w-4 h-4 ml-2" />
              SMS & WhatsApp
            </TabsTrigger>
            <TabsTrigger value="banner">
              <AlertCircle className="w-4 h-4 ml-2" />
              באנרים
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Globe className="w-4 h-4 ml-2" />
              SEO & קישורים
            </TabsTrigger>
          </TabsList>

          {/* Email Templates */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>תבניות מייל אוטומטיות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField
                  settingKey="EMAIL_WELCOME_SUBJECT"
                  label="נושא מייל ברוך הבא"
                  category="EMAIL_TEMPLATES"
                />
                <SettingField
                  settingKey="EMAIL_WELCOME_BODY"
                  label="תוכן מייל ברוך הבא"
                  description="השתמש ב-{{name}} עבור שם המשתמש"
                  category="EMAIL_TEMPLATES"
                  type="textarea"
                  rows={8}
                />
                <SettingField
                  settingKey="EMAIL_BOOKING_CONFIRMED_SUBJECT"
                  label="נושא מייל אישור הזמנה"
                  category="EMAIL_TEMPLATES"
                />
                <SettingField
                  settingKey="EMAIL_BOOKING_CONFIRMED_BODY"
                  label="תוכן מייל אישור הזמנה"
                  description="משתנים זמינים: {{guest_name}}, {{listing_title}}, {{check_in}}, {{check_out}}"
                  category="EMAIL_TEMPLATES"
                  type="textarea"
                  rows={8}
                />
                <SettingField
                  settingKey="EMAIL_PASSWORD_RESET_SUBJECT"
                  label="נושא מייל איפוס סיסמה"
                  category="EMAIL_TEMPLATES"
                />
                <SettingField
                  settingKey="EMAIL_PASSWORD_RESET_BODY"
                  label="תוכן מייל איפוס סיסמה"
                  description="השתמש ב-{{reset_link}} עבור קישור האיפוס"
                  category="EMAIL_TEMPLATES"
                  type="textarea"
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS & WhatsApp Templates */}
          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>תבניות SMS & WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 שים לב: הודעות SMS מוגבלות ל-160 תווים. השתמש בתבניות קצרות וברורות.
                  </p>
                </div>
                <SettingField
                  settingKey="SMS_BOOKING_CONFIRMED"
                  label="הודעת אישור הזמנה (SMS)"
                  description="השתמש ב-{{guest_name}}, {{listing_title}}, {{check_in}}"
                  category="SMS_TEMPLATES"
                  type="textarea"
                  rows={3}
                />
                <SettingField
                  settingKey="SMS_CHECKIN_REMINDER"
                  label="תזכורת צ'ק-אין (SMS)"
                  category="SMS_TEMPLATES"
                  type="textarea"
                  rows={3}
                />
                <SettingField
                  settingKey="WHATSAPP_SOS_ALERT"
                  label="התראת חירום (WhatsApp)"
                  category="SMS_TEMPLATES"
                  type="textarea"
                  rows={4}
                />
                <SettingField
                  settingKey="WHATSAPP_HOST_NEW_BOOKING"
                  label="הודעה למארח על הזמנה חדשה (WhatsApp)"
                  category="SMS_TEMPLATES"
                  type="textarea"
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Banners */}
          <TabsContent value="banner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>הודעות מערכת (באנרים)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ באנרים יוצגו בראש כל עמודי האתר. השתמש בהם להודעות חשובות בלבד.
                  </p>
                </div>
                <SettingField
                  settingKey="SITE_BANNER_ACTIVE"
                  label="הפעל באנר"
                  description="הזן 'true' להפעלה או 'false' לכיבוי"
                  category="SITE_BANNERS"
                />
                <SettingField
                  settingKey="SITE_BANNER_TEXT"
                  label="טקסט הבאנר"
                  description="לדוגמה: 'האתר יהיה בתחזוקה בין 02:00-04:00'"
                  category="SITE_BANNERS"
                  type="textarea"
                  rows={2}
                />
                <SettingField
                  settingKey="SITE_BANNER_TYPE"
                  label="סוג באנר"
                  description="info / warning / error"
                  category="SITE_BANNERS"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO & Social Links */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Search className="w-5 h-5 inline ml-2" />
                  הגדרות SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField
                  settingKey="SEO_HOME_TITLE"
                  label="כותרת דף הבית (Title Tag)"
                  description="מקסימום 60 תווים"
                  category="SEO"
                />
                <SettingField
                  settingKey="SEO_HOME_DESCRIPTION"
                  label="תיאור דף הבית (Meta Description)"
                  description="מקסימום 160 תווים"
                  category="SEO"
                  type="textarea"
                  rows={3}
                />
                <SettingField
                  settingKey="SEO_KEYWORDS"
                  label="מילות מפתח"
                  description="מופרדות בפסיקים"
                  category="SEO"
                  type="textarea"
                  rows={2}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>קישורים לרשתות חברתיות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField
                  settingKey="SOCIAL_FACEBOOK"
                  label={
                    <span className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </span>
                  }
                  description="כתובת URL מלאה"
                  category="SOCIAL_LINKS"
                />
                <SettingField
                  settingKey="SOCIAL_INSTAGRAM"
                  label={
                    <span className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </span>
                  }
                  description="כתובת URL מלאה"
                  category="SOCIAL_LINKS"
                />
                <SettingField
                  settingKey="SOCIAL_WHATSAPP"
                  label="WhatsApp עסקי"
                  description="מספר טלפון עם קידומת +972"
                  category="SOCIAL_LINKS"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}