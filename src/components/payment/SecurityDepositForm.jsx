import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SecurityDepositForm({ booking, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const depositTier = booking.financials?.deposit_tier || 'STANDARD';
  const depositAmount = depositTier === 'LUXURY' ? 5000 : 2000;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        setError(pmError.message);
        setProcessing(false);
        return;
      }

      // Call backend to authorize the deposit
      const response = await base44.functions.invoke('authorizeSecurityDeposit', {
        bookingId: booking.id,
        paymentMethodId: paymentMethod.id,
        depositTier,
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('פיקדון בטחון אושר בהצלחה');
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setError(response.data.error || 'שגיאה באישור הפיקדון');
      }

    } catch (err) {
      console.error('Security deposit error:', err);
      setError(err.message || 'שגיאה באישור הפיקדון');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">פיקדון אושר בהצלחה</h3>
        <p className="text-sm text-gray-600 mb-4">
          ₪{depositAmount.toLocaleString()} הוחזק בכרטיס שלך
        </p>
        <p className="text-xs text-gray-500">
          הסכום ישוחרר אוטומטית בתום השהייה אם לא יהיו נזקים
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">פיקדון בטחון</h4>
            <p className="text-sm text-blue-700 mb-2">
              נחזיק ₪{depositAmount.toLocaleString()} על הכרטיס שלך כפיקדון בטחון
            </p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• הסכום לא יחויב עכשיו - רק יוחזק</li>
              <li>• ישוחרר אוטומטית אחרי Check-out</li>
              <li>• יחויב רק במקרה של נזקים</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          פרטי כרטיס אשראי
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            מאשר פיקדון...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            אשר פיקדון בטחון ₪{depositAmount.toLocaleString()}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        תשלום מאובטח באמצעות Stripe 🔒
      </p>
    </form>
  );
}