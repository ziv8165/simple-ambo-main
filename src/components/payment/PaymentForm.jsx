import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentForm({ listingId, receiverId, amount, onSuccess }) {
  const [paymentType, setPaymentType] = useState('DEPOSIT');
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      return await base44.entities.Payment.create(paymentData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('התשלום בוצע בהצלחה!');
      onSuccess?.(data);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Get user
      const user = await base44.auth.me();

      // Create payment intent on your backend (would need backend function)
      // For demo, we'll simulate the flow
      const cardElement = elements.getElement(CardElement);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      // Create payment record
      await createPaymentMutation.mutateAsync({
        listingId,
        payerId: user.id,
        receiverId,
        amount,
        type: paymentType,
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        description: `תשלום ${paymentType === 'DEPOSIT' ? 'מקדמה' : 'דמי שכירות'}`,
        paidAt: new Date().toISOString(),
        stripePaymentIntentId: `pi_demo_${Date.now()}`
      });

      // Generate invoice
      const invoiceNumber = `INV-${Date.now()}`;
      await base44.entities.Invoice.create({
        paymentId: 'payment_' + Date.now(),
        invoiceNumber,
        issuedTo: user.id,
        issuedBy: receiverId,
        amount,
        description: `תשלום עבור נכס`,
        issuedDate: new Date().toISOString()
      });

    } catch (error) {
      toast.error('שגיאה בביצוע התשלום');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div>
        <Label className="mb-2">סוג תשלום</Label>
        <Select value={paymentType} onValueChange={setPaymentType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEPOSIT">מקדמה</SelectItem>
            <SelectItem value="RENT_PAYMENT">דמי שכירות</SelectItem>
            <SelectItem value="SECURITY_DEPOSIT">פיקדון ביטחון</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2">סכום לתשלום</Label>
        <div className="text-3xl font-bold text-[#1A1A1A] mb-4">
          ₪{amount.toLocaleString()}
        </div>
      </div>

      <div>
        <Label className="mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          פרטי כרטיס אשראי
        </Label>
        <div className="border rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1A1A1A',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>התשלום מאובטח באמצעות Stripe. פרטי כרטיס האשראי שלך מוצפנים ואינם נשמרים בשרתים שלנו.</p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A] text-lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            מעבד תשלום...
          </>
        ) : (
          `שלם ₪${amount.toLocaleString()}`
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        על ידי ביצוע תשלום, אתה מאשר את תנאי השימוש ומדיניות הביטולים
      </p>
    </form>
  );
}