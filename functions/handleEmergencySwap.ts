import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, newListingId } = await req.json();

    if (!bookingId || !newListingId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current booking
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking || booking.guestId !== user.id) {
      return Response.json({ error: 'Booking not found or forbidden' }, { status: 404 });
    }

    // Get current listing
    const currentListings = await base44.entities.Listing.filter({ id: booking.listingId });
    const currentListing = currentListings[0];

    // Get new listing
    const newListings = await base44.entities.Listing.filter({ id: newListingId });
    const newListing = newListings[0];

    if (!currentListing || !newListing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Calculate price delta
    const delta = newListing.pricePerNight - currentListing.pricePerNight;

    // Check deposit tier change
    const currentTier = booking.financials?.deposit_tier || 'STANDARD';
    const newTier = newListing.pricePerNight >= 1000 ? 'LUXURY' : 'STANDARD';
    const depositUpgrade = currentTier === 'STANDARD' && newTier === 'LUXURY';

    if (delta <= 0 && !depositUpgrade) {
      // Approve swap immediately - no extra cost
      await base44.entities.Booking.update(bookingId, {
        listingId: newListingId,
        hostId: newListing.hostId,
        basePrice: newListing.pricePerNight,
        financials: {
          ...booking.financials,
          deposit_tier: newTier
        }
      });

      return Response.json({
        success: true,
        requiresPayment: false,
        message: 'Swap confirmed at no extra cost.'
      });
    } else {
      // Requires payment
      return Response.json({
        success: false,
        requiresPayment: true,
        delta: Math.max(delta, 0),
        depositUpgrade,
        depositUpgradeAmount: depositUpgrade ? 3000 : 0,
        message: `Additional payment required: ₪${Math.max(delta, 0)}${depositUpgrade ? ' + ₪3000 deposit upgrade' : ''}`
      });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});