import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeApiKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const { action } = await req.json();

    // Create Stripe Connect account
    if (action === 'create_account') {
      const response = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          type: 'express',
          email: user.email,
          'capabilities[card_payments][requested]': 'true',
          'capabilities[transfers][requested]': 'true',
          country: 'IL',
          'business_profile[product_description]': 'Short-term rental hosting',
        })
      });

      const account = await response.json();

      if (!response.ok) {
        throw new Error(account.error?.message || 'Failed to create Stripe account');
      }

      // Save account ID to user
      await base44.entities.User.update(user.id, {
        stripe_account_id: account.id
      });

      // Create account link for onboarding
      const linkResponse = await fetch('https://api.stripe.com/v1/account_links', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          account: account.id,
          refresh_url: `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/host-dashboard`,
          return_url: `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/host-dashboard?stripe_success=true`,
          type: 'account_onboarding'
        })
      });

      const link = await linkResponse.json();

      return Response.json({
        accountId: account.id,
        onboardingUrl: link.url
      });
    }

    // Get account status
    if (action === 'get_status') {
      const userData = await base44.entities.User.filter({ id: user.id });
      const stripeAccountId = userData[0]?.stripe_account_id;

      if (!stripeAccountId) {
        return Response.json({ connected: false });
      }

      const response = await fetch(`https://api.stripe.com/v1/accounts/${stripeAccountId}`, {
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`
        }
      });

      const account = await response.json();

      return Response.json({
        connected: true,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
      });
    }

    // Create payout
    if (action === 'create_payout') {
      const userData = await base44.entities.User.filter({ id: user.id });
      const stripeAccountId = userData[0]?.stripe_account_id;

      if (!stripeAccountId) {
        return Response.json({ error: 'No Stripe account connected' }, { status: 400 });
      }

      const { amount } = await req.json();

      const response = await fetch('https://api.stripe.com/v1/payouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Stripe-Account': stripeAccountId,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100),
          currency: 'ils',
          description: 'Simple Ambo host payout'
        })
      });

      const payout = await response.json();

      if (!response.ok) {
        throw new Error(payout.error?.message || 'Failed to create payout');
      }

      return Response.json({ success: true, payout });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Stripe Connect error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});