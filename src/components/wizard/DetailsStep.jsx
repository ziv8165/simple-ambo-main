import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb } from 'lucide-react';
import FeedbackBubble from '@/components/feedback/FeedbackBubble';

export default function DetailsStep({ data, updateData, adminFeedback = {} }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        עכשיו, בואו נתן שם לנכס שלכם
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        כותרות קצרות עובדות הכי טוב. אל תדאגו, תמיד אפשר לערוך אותן אחר כך.
      </p>

      <div className="space-y-8">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-lg font-semibold text-[#4A2525]">
              כותרת
            </label>
            {adminFeedback.title && <FeedbackBubble feedback={adminFeedback.title} />}
          </div>
          <Input
            value={data.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="דירת סטודיו מעוצבת בלב העיר"
            className="text-lg"
            maxLength={50}
          />
          <p className="text-sm text-[#4A2525]/50 mt-2">
            {(data.title || '').length}/50 תווים
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-lg font-semibold text-[#4A2525]">
              תיאור
            </label>
            {adminFeedback.summary && <FeedbackBubble feedback={adminFeedback.summary} />}
          </div>
          <Textarea
            value={data.summary || ''}
            onChange={(e) => updateData({ summary: e.target.value })}
            placeholder="ספרו לאורחים על הנכס שלכם..."
            className="text-lg min-h-[150px]"
            maxLength={500}
          />
          <p className="text-sm text-[#4A2525]/50 mt-2">
            {(data.summary || '').length}/500 תווים
          </p>
        </div>



        {/* Availability Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4A2525] mb-2">
              זמין מתאריך
            </label>
            <Input
              type="date"
              value={data.availableFrom || ''}
              onChange={(e) => updateData({ availableFrom: e.target.value })}
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A2525] mb-2">
              זמין עד תאריך
            </label>
            <Input
              type="date"
              value={data.availableTo || ''}
              onChange={(e) => updateData({ availableTo: e.target.value })}
              className="text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}