import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Get booking details
    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get listing and user details
    const [listings, users] = await Promise.all([
      base44.asServiceRole.entities.Listing.filter({ id: booking.listingId }),
      base44.asServiceRole.entities.User.filter({ id: booking.guestId })
    ]);

    const listing = listings[0];
    const guest = users[0];

    if (!listing || !guest) {
      return Response.json({ error: 'Listing or guest not found' }, { status: 404 });
    }

    // Send notification to guest
    const notificationData = {
      guestName: guest.full_name || guest.email.split('@')[0],
      listingTitle: listing.title || `${listing.neighborhood}, ${listing.city}`,
      checkIn: new Date(booking.dates.start).toLocaleDateString('he-IL'),
      checkOut: new Date(booking.dates.end).toLocaleDateString('he-IL'),
      totalPrice: booking.totalPrice?.toLocaleString()
    };

    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: booking.guestId,
      type: 'BOOKING_CONFIRMED',
      data: notificationData
    });

    // Also notify host
    const [hosts] = await base44.asServiceRole.entities.User.filter({ id: booking.hostId });
    const host = hosts;

    if (host) {
      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: booking.hostId,
        type: 'HOST_BOOKING_REQUEST',
        data: {
          hostName: host.full_name || host.email.split('@')[0],
          guestName: notificationData.guestName,
          listingTitle: notificationData.listingTitle,
          checkIn: notificationData.checkIn,
          checkOut: notificationData.checkOut,
          totalPrice: notificationData.totalPrice
        }
      });
    }

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});