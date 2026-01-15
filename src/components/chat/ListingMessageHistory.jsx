import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

export default function ListingMessageHistory({ listingId }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['listingMessages', listingId],
    queryFn: async () => {
      const allMessages = await base44.entities.ChatMessage.list();
      return allMessages.filter(msg => msg.listingId === listingId);
    },
    enabled: !!user && !!listingId
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  // Group messages by conversation
  const conversations = messages.reduce((acc, msg) => {
    if (!acc[msg.conversationId]) {
      acc[msg.conversationId] = [];
    }
    acc[msg.conversationId].push(msg);
    return acc;
  }, {});

  // Get conversation summaries
  const conversationSummaries = Object.entries(conversations).map(([convId, msgs]) => {
    const sortedMsgs = msgs.sort((a, b) => 
      new Date(b.timestamp || b.created_date) - new Date(a.timestamp || a.created_date)
    );
    const lastMessage = sortedMsgs[0];
    const otherUserId = lastMessage.senderId === user?.id 
      ? lastMessage.receiverId 
      : lastMessage.senderId;
    const otherUser = users.find(u => u.id === otherUserId);
    const unreadCount = msgs.filter(m => !m.read && m.receiverId === user?.id).length;

    return {
      conversationId: convId,
      lastMessage,
      otherUser,
      messageCount: msgs.length,
      unreadCount
    };
  });

  if (isLoading) {
    return <div className="text-center py-4 text-[#422525]/60">טוען...</div>;
  }

  if (!user) {
    return (
      <Card className="border-[#E6DDD0]">
        <CardContent className="py-8 text-center">
          <MessageCircle className="w-12 h-12 text-[#422525]/30 mx-auto mb-3" />
          <p className="text-[#422525]/60">התחבר כדי לראות היסטוריית הודעות</p>
        </CardContent>
      </Card>
    );
  }

  if (conversationSummaries.length === 0) {
    return (
      <Card className="border-[#E6DDD0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <MessageCircle className="w-5 h-5 text-[#E3C766]" />
            <span>היסטוריית הודעות</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-[#422525]/60">אין הודעות עדיין לנכס זה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E6DDD0]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <MessageCircle className="w-5 h-5 text-[#E3C766]" />
          <span>היסטוריית הודעות ({conversationSummaries.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversationSummaries.map(({ conversationId, lastMessage, otherUser, messageCount, unreadCount }) => (
            <div key={conversationId} className="p-3 bg-[#E6DDD0]/30 rounded-lg hover:bg-[#E6DDD0]/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <h4 className="font-medium text-[#1A1A1A]">
                      {otherUser?.full_name || 'משתמש'}
                    </h4>
                    {unreadCount > 0 && (
                      <Badge className="bg-[#E3C766] text-[#1A1A1A]">{unreadCount}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#422525]/70 mt-1">
                    {messageCount} הודעות
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#422525]/80 text-right line-clamp-2 mb-2">
                {lastMessage.message}
              </p>
              <div className="flex items-center gap-1 text-xs text-[#422525]/60 justify-end">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(parseISO(lastMessage.timestamp || lastMessage.created_date), 'd MMM yyyy, HH:mm', { locale: he })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}