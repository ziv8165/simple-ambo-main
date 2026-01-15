import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins or hosts can release deposits
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { bookingId, captureAmount } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Fetch booking
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const authorizationId = booking.financials?.deposit_auth_id;

    if (!authorizationId) {
      return Response.json({ 
        error: 'No security deposit authorization found for this booking' 
      }, { status: 400 });
    }

    // If captureAmount is provided, capture that amount (for damages)
    // Otherwise, cancel the authorization (release the hold)
    if (captureAmount && captureAmount > 0) {
      // Capture partial or full amount for damages
      const paymentIntent = await stripe.paymentIntents.capture(authorizationId, {
        amount_to_capture: captureAmount, // in agorot
      });

      await base44.entities.Booking.update(bookingId, {
        financials: {
          ...booking.financials,
          deposit_captured: true,
          deposit_captured_amount: captureAmount,
        },
      });

      console.log(`Captured ${captureAmount} agorot from deposit ${authorizationId}`);

      return Response.json({
        success: true,
        captured: true,
        amount: captureAmount,
        message: `Captured ₪${(captureAmount / 100).toFixed(2)} for damages`,
      });

    } else {
      // Cancel the authorization (release the hold)
      const paymentIntent = await stripe.paymentIntents.cancel(authorizationId);

      await base44.entities.Booking.update(bookingId, {
        financials: {
          ...booking.financials,
          deposit_released: true,
          deposit_released_at: new Date().toISOString(),
        },
      });

      console.log(`Released security deposit ${authorizationId} for booking ${bookingId}`);

      return Response.json({
        success: true,
        released: true,
        message: 'Security deposit released successfully',
      });
    }

  } catch (error) {
    console.error('Release security deposit error:', error);
    return Response.json({ 
      error: 'Failed to release security deposit',
      details: error.message 
    }, { status: 500 });
  }
});