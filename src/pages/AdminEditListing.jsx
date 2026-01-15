import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminEditListing() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['adminEditListing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (listing) {
      setFormData(listing);
    }
  }, [listing]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Listing.update(listingId, data),
    onSuccess: () => {
      toast.success('המודעה עודכנה בהצלחה');
      queryClient.invalidateQueries(['adminEditListing', listingId]);
      navigate(createPageUrl('AdminDashboard'));
    },
    onError: () => {
      toast.error('שגיאה בעדכון המודעה');
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">מודעה לא נמצאה</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('AdminDashboard'))}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">עריכת מודעה</h1>
            <p className="text-sm text-gray-500">מזהה: {listing.short_id || listing.id}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            שמור שינויים
          </Button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          {/* כותרת */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">כותרת</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="כותרת המודעה"
            />
          </div>

          {/* תיאור כללי */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תיאור כללי</label>
            <Textarea
              value={formData.summary || ''}
              onChange={(e) => handleChange('summary', e.target.value)}
              placeholder="תיאור כללי של הנכס"
              className="min-h-[100px]"
            />
          </div>

          {/* פרטי הנכס */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פרטי הנכס</label>
            <Textarea
              value={formData.the_space || ''}
              onChange={(e) => handleChange('the_space', e.target.value)}
              placeholder="פרטים נוספים על הנכס"
              className="min-h-[120px]"
            />
          </div>

          {/* מיקום */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">עיר</label>
              <Input
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="עיר"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שכונה</label>
              <Input
                value={formData.neighborhood || ''}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="שכונה"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">כתובת מלאה</label>
            <Input
              value={formData.realAddress || ''}
              onChange={(e) => handleChange('realAddress', e.target.value)}
              placeholder="כתובת מלאה"
            />
          </div>

          {/* פרטים בסיסיים */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חדרים</label>
              <Input
                type="number"
                value={formData.rooms || 0}
                onChange={(e) => handleChange('rooms', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חדרי שינה</label>
              <Input
                type="number"
                value={formData.bedrooms || 0}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מחיר ללילה</label>
              <Input
                type="number"
                value={formData.pricePerNight || 0}
                onChange={(e) => handleChange('pricePerNight', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שכירות חודשית</label>
              <Input
                type="number"
                value={formData.user_declared_rent || 0}
                onChange={(e) => handleChange('user_declared_rent', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* תמונות */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תמונות</label>
            <div className="grid grid-cols-3 gap-2">
              {formData.photos?.map((photo, idx) => (
                <img key={idx} src={photo} alt="" className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.photos?.length || 0} תמונות
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}