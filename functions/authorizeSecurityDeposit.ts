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

    const { bookingId, paymentMethodId, depositTier } = await req.json();

    if (!bookingId || !paymentMethodId) {
      return Response.json({ 
        error: 'Missing required fields: bookingId, paymentMethodId' 
      }, { status: 400 });
    }

    // Fetch booking details
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user is the guest
    if (booking.guestId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine deposit amount based on tier
    const tier = depositTier || booking.financials?.deposit_tier || 'STANDARD';
    const depositAmount = tier === 'LUXURY' ? 500000 : 200000; // 5000 or 2000 ILS in agorot

    // Create Payment Intent with authorization (capture_method: manual)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'ils',
      payment_method: paymentMethodId,
      customer: user.stripeCustomerId || undefined,
      confirm: true,
      capture_method: 'manual', // THIS IS KEY - Hold only, don't capture
      description: `Security deposit for booking ${booking.id}`,
      metadata: {
        bookingId: booking.id,
        guestId: user.id,
        type: 'security_deposit',
        depositTier: tier,
      },
    });

    if (paymentIntent.status !== 'requires_capture') {
      return Response.json({
        error: 'Authorization failed',
        details: paymentIntent.status,
      }, { status: 400 });
    }

    // Update booking with deposit authorization ID
    await base44.entities.Booking.update(bookingId, {
      financials: {
        ...booking.financials,
        deposit_auth_id: paymentIntent.id,
        deposit_tier: tier,
      },
    });

    // Log the authorization
    console.log(`Security deposit authorized: ${paymentIntent.id} for booking ${bookingId}`);

    return Response.json({
      success: true,
      authorizationId: paymentIntent.id,
      amount: depositAmount,
      tier,
      message: 'Security deposit authorized successfully. Amount will be held on your card.',
    });

  } catch (error) {
    console.error('Security deposit authorization error:', error);
    return Response.json({ 
      error: 'Failed to authorize security deposit',
      details: error.message 
    }, { status: 500 });
  }
});