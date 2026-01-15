import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { MessageCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConversationList({ conversations, currentUserId, onSelectConversation, selectedConversationId }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">אין שיחות עדיין</p>
        <p className="text-sm text-gray-400 mt-2">התחל שיחה עם מארח או אורח</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        const unreadCount = conv.messages.filter(
          m => m.senderId !== currentUserId && !m.read
        ).length;
        const isSelected = selectedConversationId === conv.id;

        return (
          <Card
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 border ${
              isSelected ? 'border-[#008489] border-2 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conv.otherUser?.full_name || 'משתמש'}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(lastMessage.timestamp), { 
                        addSuffix: true, 
                        locale: he 
                      })}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage?.message || 'אין הודעות'}
                </p>
                
                {conv.listing && (
                  <p className="text-xs text-gray-500 mt-1">
                    {conv.listing.title || conv.listing.city}
                  </p>
                )}
              </div>

              {unreadCount > 0 && (
                <Badge className="bg-[#008489] text-white hover:bg-[#006A70]">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}