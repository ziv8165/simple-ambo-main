import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // שליפת נתונים
    const [myListings, myBookings, myPayments, userData, supportTickets] = await Promise.all([
      base44.asServiceRole.entities.Listing.filter({ hostId: user.id }),
      base44.asServiceRole.entities.Booking.filter({ hostId: user.id }),
      base44.asServiceRole.entities.Payment.filter({ receiverId: user.id }),
      base44.asServiceRole.entities.User.filter({ id: user.id }),
      base44.asServiceRole.entities.SupportTicket.filter({ userId: user.id })
    ]);

    const userRecord = userData[0] || {};

    // חישוב סטטיסטיקות (מדומה - צריך analytics אמיתי)
    const stats = {
      views: myListings.reduce((sum, l) => sum + (l.view_count || 0), 0),
      clicks: myListings.reduce((sum, l) => sum + (l.click_count || 0), 0),
      checkoutStarted: myBookings.filter(b => b.status === 'PENDING').length,
      bookingsCompleted: myBookings.filter(b => b.status === 'COMPLETED').length,
      conversionRate: myListings.length > 0 ? ((myBookings.length / (myListings.reduce((sum, l) => sum + (l.click_count || 1), 0))) * 100).toFixed(1) : '0',
      totalRevenue: myPayments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    // AI Suggestions
    const aiSuggestions = [];
    
    myListings.forEach(listing => {
      const clicks = listing.click_count || 0;
      const views = listing.view_count || 0;
      
      // נמוך CTR - בעיית תמונות
      if (views > 100 && clicks < views * 0.05) {
        aiSuggestions.push({
          type: 'LOW_CTR',
          severity: 'MEDIUM',
          listingId: listing.id,
          message: `התמונה הראשית של "${listing.title}" לא מושכת. מודעות עם תמונות מוארות באזור שלך מקבלות 40% יותר קליקים. שקול להחליף תמונה.`,
          action: 'עדכן תמונות'
        });
      }

      // מחיר גבוה
      const avgPrice = listing.system_estimated_rent ? listing.system_estimated_rent / 30 : 0;
      if (listing.pricePerNight > avgPrice * 1.15) {
        aiSuggestions.push({
          type: 'HIGH_PRICE',
          severity: 'HIGH',
          listingId: listing.id,
          message: `המחיר של "${listing.title}" (₪${listing.pricePerNight}) גבוה ב-15% מהממוצע באזור. זה עלול להוריד את שיעור ההזמנות.`,
          action: 'התאם מחיר'
        });
      }
    });

    // חישוב Wallet
    const now = new Date();
    const checkInThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const completedBookings = myBookings.filter(b => {
      const checkInDate = b.dates?.start ? new Date(b.dates.start) : null;
      return checkInDate && checkInDate <= checkInThreshold && b.status === 'COMPLETED';
    });

    const pendingBookings = myBookings.filter(b => {
      const checkInDate = b.dates?.start ? new Date(b.dates.start) : null;
      return !checkInDate || checkInDate > checkInThreshold || b.status === 'UPCOMING';
    });

    const availableBalance = completedBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) * 0.9), 0);
    const pendingBalance = pendingBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) * 0.9), 0);
    const lifetimeEarnings = myBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) * 0.9), 0);

    // ארגון נכסים לפי סטטוס
    const activeListings = myListings.filter(l => l.status === 'ACTIVE');
    const pendingListings = myListings.filter(l => l.status === 'PENDING_REVIEW' || l.status === 'CHANGES_REQUESTED' || l.status === 'READY_FOR_PRICING');
    const archivedListings = myListings.filter(l => l.status === 'ARCHIVED');
    const removedListings = myListings.filter(l => l.status === 'REMOVED' && l.removed_at);

    // היסטוריית תשלומים
    const paymentHistory = myPayments
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .map(p => ({
        id: p.id,
        amount: p.amount,
        date: p.created_date,
        status: p.status,
        type: p.type,
        description: p.description,
        bookingId: p.bookingId
      }));

    const wallet = {
      available: Math.round(availableBalance),
      pending: Math.round(pendingBalance),
      lifetimeEarnings: Math.round(lifetimeEarnings),
      nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      stripeConnected: !!userRecord.stripe_account_id
    };

    return Response.json({
      stats,
      aiSuggestions,
      myListings: {
        active: activeListings,
        pending: pendingListings,
        archived: archivedListings,
        removed: removedListings
      },
      wallet,
      paymentHistory,
      supportTickets: supportTickets.filter(t => t.status !== 'CLOSED')
    });

  } catch (error) {
    console.error('Error in getHostDashboardData:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});