import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PaymentForm from './PaymentForm';

// Note: Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51234567890abcdef');

export default function PaymentDialog({ 
  open, 
  onOpenChange, 
  listingId, 
  receiverId, 
  amount,
  onSuccess 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">ביצוע תשלום</DialogTitle>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <PaymentForm
            listingId={listingId}
            receiverId={receiverId}
            amount={amount}
            onSuccess={(payment) => {
              onSuccess?.(payment);
              onOpenChange(false);
            }}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}