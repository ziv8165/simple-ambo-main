import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function ContactHostButton({ listing, variant = 'default' }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingMessages = [] } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: () => base44.entities.ChatMessage.list(),
    enabled: !!user
  });

  const createMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.ChatMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      navigate(createPageUrl('Chat'));
    }
  });

  const handleContactHost = async () => {
    if (!user) {
      toast.error('יש להתחבר כדי לשלוח הודעה');
      base44.auth.redirectToLogin();
      return;
    }

    if (user.id === listing.hostId) {
      toast.error('זה הנכס שלך');
      return;
    }

    // Check if conversation already exists
    const conversationId = `${listing.id}_${user.id}`;
    const existingConversation = existingMessages.find(
      msg => msg.conversationId === conversationId
    );

    if (existingConversation) {
      // Navigate to existing conversation
      navigate(createPageUrl('Chat'));
    } else {
      // Create first message to start conversation
      createMessageMutation.mutate({
        conversationId,
        senderId: user.id,
        receiverId: listing.hostId,
        listingId: listing.id,
        message: `שלום, אני מעוניין/ת בדירה שלך ב${listing.city}`,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <Button
      onClick={handleContactHost}
      variant={variant}
      className={
        variant === 'outline'
          ? 'border-[#E6DDD0] hover:bg-[#E6DDD0]'
          : 'bg-[#1A1A1A] hover:bg-[#333] text-white'
      }
    >
      <MessageCircle className="w-4 h-4 ml-2" />
      שלח הודעה למארח
    </Button>
  );
}