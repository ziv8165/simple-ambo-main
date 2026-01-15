import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageInput({ conversationId, listingId, receiverId, onMessageSent }) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const detectPhoneNumber = (text) => {
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    return phoneRegex.test(text);
  };

  const handleSend = async (imageUrl = null) => {
    if (!message.trim() && !imageUrl) return;

    const hasPhone = detectPhoneNumber(message);
    setSending(true);

    try {
      await base44.entities.ChatMessage.create({
        conversationId,
        listingId,
        receiverId,
        message: message.trim() || '📷 תמונה',
        imageUrl,
        hasPhoneWarning: hasPhone,
        timestamp: new Date().toISOString()
      });

      setMessage('');
      onMessageSent?.();
      
      if (hasPhone) {
        toast.warning('זיהינו מספר טלפון בהודעה. מומלץ לא לשתף פרטי קשר לפני אישור ההזמנה.');
      }
    } catch (error) {
      toast.error('שגיאה בשליחת ההודעה');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('הקובץ גדול מדי. מקסימום 5MB');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await handleSend(file_url);
    } catch (error) {
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </Button>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="כתוב הודעה..."
          className="flex-1 min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-[#008489] focus:ring-[#008489]"
          rows={1}
          disabled={sending}
        />

        <Button
          onClick={() => handleSend()}
          disabled={(!message.trim() && !uploading) || sending}
          className="bg-[#008489] hover:bg-[#006A70] text-white"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}