import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PRESET_FEEDBACK = {
  title: [
    'הכותרת לא מספיק מושכת - הוסף פרטים ייחודיים',
    'הכותרת ארוכה מדי - קצר ל-60 תווים',
    'הכותרת חסרה מילות מפתח - הוסף מיקום/תכונות',
  ],
  summary: [
    'התיאור קצר מדי - הרחב לפחות ל-100 מילים',
    'חסר פירוט על השכונה והסביבה',
    'הוסף מידע על תחבורה ציבורית קרובה',
  ],
  the_space: [
    'חסר תיאור של חדרי השינה',
    'לא צוין האם יש מרפסת או חצר',
    'הוסף פירוט על מצב הריהוט',
  ],
  photos: [
    'חסרות תמונות - הוסף לפחות 5 תמונות',
    'התמונות לא באיכות גבוהה מספיק',
    'הוסף תמונות של חדר השינה והמטבח',
    'התמונה הראשית לא מושכת - החלף',
  ],
  pricePerNight: [
    'המחיר גבוה ב-20% מהשוק - התאם למחיר מומלץ',
    'המחיר נמוך מדי - עלול לעורר חשד',
  ],
  location: [
    'הכתובת לא מדויקת מספיק',
    'חסר פירוט על השכונה',
  ],
  amenities: [
    'חסרות תכונות בסיסיות - ודא שסימנת הכל',
    'לא צוין האם יש WiFi',
  ],
};

export default function SectionFeedbackModal({ open, onClose, section, sectionData, currentFeedback, onSave }) {
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [selectedPresets, setSelectedPresets] = useState([]);

  const sectionNames = {
    title: 'כותרת',
    summary: 'תיאור כללי',
    the_space: 'פרטי הנכס',
    photos: 'תמונות',
    pricePerNight: 'מחיר ללילה',
    location: 'מיקום וכתובת',
    amenities: 'תכונות ושירותים',
  };

  const handlePresetClick = (preset) => {
    if (selectedPresets.includes(preset)) {
      setSelectedPresets(selectedPresets.filter(p => p !== preset));
      setFeedback(feedback.replace(preset + '\n', ''));
    } else {
      setSelectedPresets([...selectedPresets, preset]);
      setFeedback(feedback ? feedback + '\n' + preset : preset);
    }
  };

  const handleSave = () => {
    onSave(section, feedback);
    onClose();
  };

  const renderSectionContent = () => {
    if (section === 'photos') {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">תמונות במודעה:</p>
          <div className="grid grid-cols-3 gap-2">
            {sectionData && sectionData.length > 0 ? (
              sectionData.map((photo, idx) => (
                <img key={idx} src={photo} alt="" className="w-full h-24 object-cover rounded-lg" />
              ))
            ) : (
              <p className="text-red-600 text-sm col-span-3">אין תמונות במודעה</p>
            )}
          </div>
        </div>
      );
    } else if (section === 'pricePerNight') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">₪{sectionData || '---'}</p>
          <p className="text-xs text-gray-500 mt-1">מחיר ללילה</p>
        </div>
      );
    } else if (section === 'location') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm"><span className="font-medium">עיר:</span> {sectionData?.city || '---'}</p>
          <p className="text-sm"><span className="font-medium">שכונה:</span> {sectionData?.neighborhood || '---'}</p>
          <p className="text-sm"><span className="font-medium">כתובת:</span> {sectionData?.realAddress || '---'}</p>
        </div>
      );
    } else if (section === 'amenities') {
      const amenities = sectionData || {};
      const allAmenities = Object.values(amenities).flat();
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {allAmenities.length > 0 ? (
              allAmenities.map((amenity, idx) => (
                <Badge key={idx} variant="outline">{amenity}</Badge>
              ))
            ) : (
              <p className="text-red-600 text-sm">לא צוינו תכונות</p>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {sectionData || 'לא צוין'}
          </p>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentFeedback ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            משוב על: {sectionNames[section]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* תוכן הסקטור */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">תוכן נוכחי:</h3>
            {renderSectionContent()}
          </div>

          {/* אפשרויות משוב מוגדרות מראש */}
          {PRESET_FEEDBACK[section] && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">בחר משוב מוכן:</h3>
              <div className="space-y-2">
                {PRESET_FEEDBACK[section].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    className={`w-full text-right px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedPresets.includes(preset)
                        ? 'bg-orange-50 border-orange-300 text-orange-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-orange-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* משוב חופשי */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">הערות נוספות (טקסט חופשי):</h3>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="כתוב הערות למארח..."
              className="min-h-[120px]"
            />
          </div>

          {/* כפתורי פעולה */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              שמור משוב
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}