import React from 'react';
import { Minus, Plus } from 'lucide-react';
import FeedbackBubble from '@/components/feedback/FeedbackBubble';

const BASICS = [
  { key: 'guests', label: 'אורחים', max: 16 },
  { key: 'bedrooms', label: 'חדרי שינה', max: 10 },
  { key: 'beds', label: 'מיטות', max: 20 },
  { key: 'bathrooms', label: 'חדרי רחצה', max: 10 }
];

export default function BasicsStep({ data, updateData, adminFeedback = {} }) {
  const handleIncrement = (key, max) => {
    if (data[key] < max) {
      updateData({ [key]: data[key] + 1 });
    }
  };

  const handleDecrement = (key) => {
    if (data[key] > 0) {
      updateData({ [key]: data[key] - 1 });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        יש לכתוב כמה פרטים בסיסיים על הנכס
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        בשלב מאוחר יותר יש להוסיף עוד פרטים, למשל טיפ וחניות.
      </p>

      {adminFeedback.basics && (
        <div className="mb-6">
          <FeedbackBubble feedback={adminFeedback.basics} />
        </div>
      )}

      <div className="space-y-8">
        {BASICS.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-6 border-b border-[#E6DDD0]">
            <span className="text-2xl font-medium text-[#4A2525]">{item.label}</span>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleDecrement(item.key)}
                disabled={data[item.key] <= 0}
                className="w-12 h-12 rounded-full border-2 border-[#4A2525] flex items-center justify-center hover:bg-[#4A2525] hover:text-white transition-colors disabled:opacity-30"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <span className="text-2xl font-bold text-[#4A2525] w-12 text-center">
                {data[item.key]}
              </span>
              
              <button
                onClick={() => handleIncrement(item.key, item.max)}
                disabled={data[item.key] >= item.max}
                className="w-12 h-12 rounded-full border-2 border-[#4A2525] flex items-center justify-center hover:bg-[#4A2525] hover:text-white transition-colors disabled:opacity-30"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}