import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Bell } from 'lucide-react';

import ConversationList from '@/components/chat/ConversationList';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import ActionMenu from '@/components/chat/ActionMenu';
import { toast } from 'sonner';

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: () => base44.entities.ChatMessage.list('-timestamp', 200),
    refetchInterval: 3000 // Poll every 3 seconds for live feel
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list()
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds) => {
      const updatePromises = messageIds.map(id =>
        base44.entities.ChatMessage.update(id, { read: true })
      );
      await Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    }
  });

  // Group messages into conversations and match with bookings
  const conversations = React.useMemo(() => {
    if (!user || !allMessages.length) return [];

    const userMessages = allMessages.filter(
      m => m.senderId === user.id || m.receiverId === user.id
    );

    const convMap = {};
    
    userMessages.forEach(msg => {
      const convId = msg.conversationId;
      if (!convMap[convId]) {
        const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        convMap[convId] = {
          id: convId,
          listingId: msg.listingId,
          otherUserId,
          messages: []
        };
      }
      convMap[convId].messages.push(msg);
    });

    return Object.values(convMap).map(conv => {
      const otherUser = users.find(u => u.id === conv.otherUserId);
      const listing = listings.find(l => l.id === conv.listingId);
      
      // Find matching booking for this conversation
      // Match by listingId and user IDs (either as guest or host)
      const conversationBooking = bookings.find(booking => 
        booking.listingId === conv.listingId &&
        ((booking.guestId === user.id && booking.hostId === conv.otherUserId) ||
         (booking.hostId === user.id && booking.guestId === conv.otherUserId))
      );
      
      conv.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      return {
        ...conv,
        otherUser,
        listing,
        booking: conversationBooking || null
      };
    }).sort((a, b) => {
      const aTime = a.messages[a.messages.length - 1]?.timestamp || 0;
      const bTime = b.messages[b.messages.length - 1]?.timestamp || 0;
      return new Date(bTime) - new Date(aTime);
    });
  }, [allMessages, user, users, listings, bookings]);

  // Calculate unread count
  const unreadCount = React.useMemo(() => {
    if (!user) return 0;
    return allMessages.filter(
      m => m.receiverId === user.id && !m.read
    ).length;
  }, [allMessages, user]);

  // Show notification for new messages
  useEffect(() => {
    if (unreadCount > 0 && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('הודעה חדשה', {
          body: `יש לך ${unreadCount} הודעות חדשות`,
          icon: '/icon.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [unreadCount]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      const unreadMessages = selectedConversation.messages
        .filter(m => m.receiverId === user.id && !m.read)
        .map(m => m.id);
      
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate(unreadMessages);
      }
    }
  }, [selectedConversation, user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
  };

  const handleActionClick = (actionId, context) => {
    // Handle action menu clicks
    switch (actionId) {
      case 'send_money':
        toast.info('פתיחת מסך תשלום...');
        // TODO: Navigate to payment page or open payment modal
        break;
      case 'request_refund':
        toast.info('פתיחת בקשת החזר...');
        // TODO: Navigate to refund request page or open modal
        break;
      case 'report_safety':
        toast.info('פתיחת דיווח על בעיית בטיחות...');
        // TODO: Navigate to safety report page or open modal
        break;
      case 'modify_reservation':
        toast.info('פתיחת שינוי הזמנה...');
        // TODO: Navigate to modify reservation page or open modal
        break;
      default:
        break;
    }
  };

  // Determine if ActionMenu should be shown (only for APPROVED bookings)
  const shouldShowActionMenu = selectedConversation?.booking?.status === 'APPROVED';

  if (!user) {
    return (
      <div className="min-h-screen bg-white relative" dir="rtl">
        <div className="pb-16 px-6 text-center relative z-10">
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative" dir="rtl">
      <div className="pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8 pt-6">
          <MessageCircle className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-semibold text-gray-900">הודעות</h1>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
              {unreadCount} חדשות
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200 bg-white">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
                  <span>שיחות</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => Notification.requestPermission()}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <ConversationList
                  conversations={conversations}
                  currentUserId={user.id}
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </CardContent>
            </Card>
          </div>

          {/* Messages View */}
          <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
            {selectedConversation ? (
              <Card className="h-[calc(100vh-200px)] flex flex-col border border-gray-200 shadow-sm bg-white">
                <CardHeader className="border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToList}
                      className="lg:hidden text-gray-600 hover:text-gray-900"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {selectedConversation.otherUser?.full_name || 'משתמש'}
                      </CardTitle>
                      {selectedConversation.listing && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {selectedConversation.listing.title || selectedConversation.listing.city}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {selectedConversation.messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderId === user.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Action Menu - Only show for APPROVED bookings */}
                {shouldShowActionMenu && (
                  <ActionMenu
                    conversationId={selectedConversation.id}
                    listingId={selectedConversation.listingId}
                    bookingId={selectedConversation.booking?.id}
                    onActionClick={handleActionClick}
                  />
                )}

                <MessageInput
                  conversationId={selectedConversation.id}
                  listingId={selectedConversation.listingId}
                  receiverId={selectedConversation.otherUserId}
                  onMessageSent={handleMessageSent}
                />
              </Card>
            ) : (
              <Card className="h-[calc(100vh-200px)] flex items-center justify-center border border-gray-200 bg-white">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">בחר שיחה כדי להתחיל</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}