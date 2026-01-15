import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, X, CheckCircle, Paperclip } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const TOPICS = [
  { value: 'BOOKING', label: 'Booking Issue' },
  { value: 'PAYMENT', label: 'Payment Issue' },
  { value: 'ACCOUNT', label: 'Account & Security' },
  { value: 'OTHER', label: 'Other' }
];

export default function ContactSupportModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [ticketId, setTicketId] = useState('');

  const submitTicketMutation = useMutation({
    mutationFn: async () => {
      // Upload attachment if exists
      let attachmentUrl = null;
      if (attachment) {
        const result = await base44.integrations.Core.UploadFile({ file: attachment });
        attachmentUrl = result.file_url;
      }

      // Simulate ticket creation
      const mockTicketId = Math.floor(1000 + Math.random() * 9000);
      setTicketId(mockTicketId.toString());
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setStep(3);
      toast.success('Support ticket created');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setMessage('');
      setAttachment(null);
    }
  };

  const handleClose = () => {
    setStep(1);
    setTopic('');
    setMessage('');
    setAttachment(null);
    setTicketId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-[#FDFCF8] rounded-3xl" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {step === 2 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-[#4A2525] hover:text-[#BC5D34] p-0 h-auto"
              >
                <ChevronRight className="w-5 h-5" />
                Back
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold text-[#4A2525] flex-1 text-center">
              {step === 1 && 'What do you need help with?'}
              {step === 2 && 'Tell us more'}
              {step === 3 && 'Your request was sent'}
            </DialogTitle>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="p-0 h-auto hover:bg-transparent"
            >
              <X className="w-5 h-5 text-[#4A2525]" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Topic Selection */}
          {step === 1 && (
            <RadioGroup value={topic} onValueChange={(value) => {
              setTopic(value);
              setStep(2);
            }}>
              <div className="space-y-4">
                {TOPICS.map((t) => (
                  <div
                    key={t.value}
                    className="flex items-center space-x-3 space-x-reverse border-b border-[#E6DDD0] pb-4"
                  >
                    <RadioGroupItem
                      value={t.value}
                      id={t.value}
                      className="border-2 border-[#4A2525] data-[state=checked]:bg-[#BC5D34] data-[state=checked]:border-[#BC5D34]"
                    />
                    <Label
                      htmlFor={t.value}
                      className="text-base text-[#4A2525] cursor-pointer flex-1 text-right"
                    >
                      {t.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Message */}
          {step === 2 && (
            <>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="min-h-[200px] text-base border-2 border-[#4A2525] rounded-xl focus:border-[#BC5D34] resize-none mb-4"
              />

              {/* Upload Attachment */}
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#4A2525] rounded-xl cursor-pointer hover:bg-[#E6DDD0]/20 transition-colors">
                <Paperclip className="w-5 h-5 text-[#4A2525]" />
                <span className="text-sm text-[#4A2525]">
                  {attachment ? attachment.name : 'Upload Attachment (Optional)'}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => submitTicketMutation.mutate()}
                  disabled={!message.trim() || submitTicketMutation.isPending}
                  className="px-8 py-6 text-base font-bold rounded-full bg-[#4A2525] hover:bg-[#BC5D34] text-white"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  {submitTicketMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#4A2525] mb-2">
                Ticket #{ticketId} Created
              </h3>
              <p className="text-lg text-[#4A2525]/70 mb-8">
                We'll reply via email within 24 hours.
              </p>
              <Button
                onClick={handleClose}
                className="px-8 py-6 text-base font-bold rounded-full bg-[#4A2525] hover:bg-[#BC5D34] text-white"
                style={{ fontFamily: 'League Spartan, sans-serif' }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}