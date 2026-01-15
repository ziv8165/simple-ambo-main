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

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user is the guest
    if (booking.guestId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update booking to SOS_CRITICAL
    await base44.entities.Booking.update(bookingId, {
      status: 'SOS_CRITICAL',
      emergency_protocol: {
        is_active: true,
        triggered_at: new Date().toISOString(),
        stage: 0,
        host_response_status: 'WAITING'
      }
    });

    // Create CRITICAL support ticket
    const ticketId = `SOS-${Date.now()}`;
    await base44.entities.SupportTicket.create({
      ticketId,
      bookingId,
      userId: user.id,
      type: 'SOS',
      priority: 'CRITICAL',
      description: `User cannot check-in to booking ${bookingId}`,
      status: 'OPEN'
    });

    return Response.json({
      success: true,
      ticketId,
      message: 'SOS Protocol activated. Admin has been notified.'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});