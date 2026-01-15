import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  const hasImage = message.imageUrl;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-lg px-4 py-2.5 shadow-sm ${
            isOwn
              ? 'bg-[#008489] text-white'
              : 'bg-white border border-gray-300 text-gray-900'
          }`}
        >
          {hasImage && (
            <img
              src={message.imageUrl}
              alt="תמונה מצורפת"
              className="rounded-lg mb-2 max-w-full"
            />
          )}
          <p className={`text-sm leading-relaxed break-words ${isOwn ? 'text-white' : 'text-gray-900'}`}>
            {message.message}
          </p>
          
          {message.hasPhoneWarning && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ שימו לב: אנחנו ממליצים לא לשתף פרטי קשר לפני אישור הזמנה
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
          <span>
            {format(new Date(message.timestamp), 'HH:mm', { locale: he })}
          </span>
          {isOwn && (
            <>
              {message.read ? (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}