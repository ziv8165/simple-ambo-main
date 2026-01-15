import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Get booking
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking || booking.guestId !== user.id) {
      return Response.json({ error: 'Booking not found or forbidden' }, { status: 404 });
    }

    // Update liability waiver
    await base44.entities.Booking.update(bookingId, {
      legal: {
        liability_waiver_accepted: true,
        liability_waiver_date: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      message: 'Liability waiver accepted'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});