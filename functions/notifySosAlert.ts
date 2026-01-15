import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { bookingId, reason } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Get booking details
    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get user and listing details
    const [users, listings] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ id: booking.guestId }),
      base44.asServiceRole.entities.Listing.filter({ id: booking.listingId })
    ]);

    const user = users[0];
    const listing = listings[0];

    if (!user || !listing) {
      return Response.json({ error: 'User or listing not found' }, { status: 404 });
    }

    // Send notification to guest
    const notificationData = {
      userName: user.full_name || user.email.split('@')[0],
      listingTitle: listing.title || `${listing.neighborhood}, ${listing.city}`,
      reason: reason || 'Issue reported'
    };

    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: booking.guestId,
      type: 'SOS_ALERT',
      data: notificationData
    });

    // Also notify host
    const [hosts] = await base44.asServiceRole.entities.User.filter({ id: booking.hostId });
    
    if (hosts) {
      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: booking.hostId,
        type: 'SOS_ALERT',
        data: {
          userName: hosts.full_name || hosts.email.split('@')[0],
          listingTitle: notificationData.listingTitle,
          reason: `Guest ${notificationData.userName} triggered SOS protocol`
        }
      });
    }

    // Notify all admins
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    
    for (const admin of admins) {
      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: admin.id,
        type: 'SOS_ALERT',
        data: {
          userName: admin.full_name || admin.email.split('@')[0],
          listingTitle: notificationData.listingTitle,
          reason: `CRITICAL: SOS activated by ${notificationData.userName}`
        }
      });
    }

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});