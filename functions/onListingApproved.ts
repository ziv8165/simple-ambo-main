import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { listingId } = await req.json();
    
    // Get the listing
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    const listing = listings[0];
    
    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Find matching users based on their preferences
    const allPreferences = await base44.asServiceRole.entities.UserMatchPreferences.filter({
      hasCompletedQuiz: true
    });

    const matchedUsers = [];

    for (const pref of allPreferences) {
      let isMatch = true;

      // Check city match
      if (pref.wantedCity && listing.city !== pref.wantedCity) {
        isMatch = false;
      }

      // Check budget range
      if (pref.budgetMax && listing.pricePerNight > pref.budgetMax) {
        isMatch = false;
      }
      if (pref.budgetMin && listing.pricePerNight < pref.budgetMin) {
        isMatch = false;
      }

      // Check zone match (if listing has zone and user has vibe tags)
      if (listing.zone && pref.vibeTags && pref.vibeTags.length > 0) {
        // Simple zone matching logic
        const zoneMatch = listing.vibeTags?.some(tag => pref.vibeTags.includes(tag));
        if (!zoneMatch && listing.vibeTags && listing.vibeTags.length > 0) {
          isMatch = false;
        }
      }

      if (isMatch) {
        matchedUsers.push({
          userId: pref.userId,
          preferences: pref
        });
      }
    }

    // Send notifications to matched users
    let sentCount = 0;
    for (const match of matchedUsers) {
      try {
        // Create notification log
        await base44.asServiceRole.entities.NotificationLog.create({
          userId: match.userId,
          type: 'SMART_MATCH',
          channel: 'PUSH',
          title: '🎯 מצאנו לך דירה!',
          content: `דירה חדשה ב${listing.city}${listing.neighborhood ? ', ' + listing.neighborhood : ''} מתאימה לחיפוש שלך. לחץ לצפייה.`,
          status: 'SENT',
          metadata: {
            listingId: listing.id,
            listingTitle: listing.title,
            price: listing.pricePerNight
          }
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send notification to user ${match.userId}:`, err);
      }
    }

    return Response.json({
      success: true,
      matchedUsersCount: matchedUsers.length,
      sentNotifications: sentCount,
      listing: {
        id: listing.id,
        title: listing.title,
        city: listing.city
      }
    });

  } catch (error) {
    console.error('Error in onListingApproved:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});