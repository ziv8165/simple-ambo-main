import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { bookingId } = await req.json();
    
    // Get booking details
    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];
    
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get host details
    const hosts = await base44.asServiceRole.entities.User.filter({ id: booking.hostId });
    const host = hosts[0];

    if (!host) {
      return Response.json({ error: 'Host not found' }, { status: 404 });
    }

    // Send immediate notification to host
    await base44.asServiceRole.entities.NotificationLog.create({
      userId: booking.hostId,
      type: 'BOOKING_REQUEST',
      channel: 'PUSH',
      title: '📅 בקשת הזמנה חדשה!',
      content: `יש לך בקשת הזמנה חדשה לתאריכים ${booking.dates?.start || ''} - ${booking.dates?.end || ''}. יש לך 24 שעות לאשר.`,
      status: 'SENT',
      metadata: {
        bookingId: booking.id,
        guestId: booking.guestId,
        listingId: booking.listingId
      }
    });

    // TODO: Schedule a reminder notification for 12 hours later
    // This would require a scheduled task system

    return Response.json({
      success: true,
      bookingId: booking.id,
      hostId: booking.hostId,
      notificationSent: true
    });

  } catch (error) {
    console.error('Error in handleNewBooking:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});