import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // שליפת נתונים אמיתיים מהדאטאבייס
    const [
      sosTickets,
      verificationQueue,
      activeListings,
      allUsers,
      payments,
      flaggedChats
    ] = await Promise.all([
      base44.asServiceRole.entities.SupportTicket.filter({ status: 'OPEN', type: 'SOS' }),
      base44.asServiceRole.entities.Listing.filter({ status: 'PENDING_REVIEW' }),
      base44.asServiceRole.entities.Listing.filter({ status: 'ACTIVE' }),
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Payment.list(),
      base44.asServiceRole.entities.ChatMessage.filter({ isFlagged: true })
    ]);

    // Parse request body for range parameter
    const body = await req.json().catch(() => ({}));
    const range = body.range || 'last6Months';
    const { startDate, endDate, searchQuery } = body;

    // חישוב הכנסות החודש
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthRevenue = payments
      .filter(p => p.created_date && new Date(p.created_date) >= currentMonthStart && p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const lastMonthRevenue = payments
      .filter(p => p.created_date && new Date(p.created_date) >= lastMonthStart && new Date(p.created_date) <= lastMonthEnd && p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // חישוב נתוני גרף חודשי
    const getMonthlyRevenueData = () => {
      const months = [];
      let monthsToShow = 6;
      
      if (range === 'currentMonth') monthsToShow = 1;
      else if (range === 'lastMonth') monthsToShow = 2;
      else if (range === 'last3Months') monthsToShow = 3;
      else if (range === 'last6Months') monthsToShow = 6;
      else if (range === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        monthsToShow = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30)) || 1;
      }

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const revenue = payments
          .filter(p => {
            if (!p.created_date || p.status !== 'COMPLETED') return false;
            const date = new Date(p.created_date);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        
        months.push({
          month: monthNames[monthStart.getMonth()],
          value: Math.round(revenue)
        });
      }
      
      return months;
    };

    const monthlyRevenueData = getMonthlyRevenueData();

    // חישוב מדד הוגנות מחירים (אגרגציה אמיתית)
    const integrityStats = activeListings.reduce((acc, listing) => {
      const price = listing.final_nightly_price || listing.pricePerNight || 0;
      const estimate = listing.system_estimated_rent ? (listing.system_estimated_rent / 30) : 0;
      
      if (estimate === 0) return acc;
      
      const ratio = price / estimate;
      
      if (ratio <= 1.05) {
        acc.fair++;
      } else if (ratio <= 1.20) {
        acc.warning++;
      } else {
        acc.high_risk++;
      }
      
      return acc;
    }, { fair: 0, warning: 0, high_risk: 0 });

    // המרה לאחוזים
    const total = integrityStats.fair + integrityStats.warning + integrityStats.high_risk;
    const integrityPercents = total > 0 ? {
      fair: Math.round((integrityStats.fair / total) * 100),
      warning: Math.round((integrityStats.warning / total) * 100),
      high_risk: Math.round((integrityStats.high_risk / total) * 100)
    } : { fair: 0, warning: 0, high_risk: 0 };

    // חישוב משתמשים פעילים בשבוע
    const startOfWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.getFullYear(), d.getMonth(), diff);
    };

    const currentWeekStart = startOfWeek(now);
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const currentWeekActiveUsers = allUsers.filter(u => 
      u.created_date && new Date(u.created_date) >= currentWeekStart
    ).length;
    
    const lastWeekActiveUsers = allUsers.filter(u => {
      const date = new Date(u.created_date);
      return date >= lastWeekStart && date < currentWeekStart;
    }).length;

    // שליפת כל המודעות עם אפשרות חיפוש
    let allListings = await base44.asServiceRole.entities.Listing.list();
    
    // סינון לפי searchQuery אם קיים
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      allListings = allListings.filter(listing => 
        (listing.short_id && listing.short_id.toLowerCase().includes(query)) ||
        (listing.title && listing.title.toLowerCase().includes(query)) ||
        (listing.city && listing.city.toLowerCase().includes(query)) ||
        (listing.realAddress && listing.realAddress.toLowerCase().includes(query)) ||
        (listing.neighborhood && listing.neighborhood.toLowerCase().includes(query))
      );
    }

    // קבלת פרטי המארחים
    const hostIds = [...new Set(allListings.map(l => l.hostId))];
    const hosts = await base44.asServiceRole.entities.User.list();
    const hostsMap = {};
    hosts.forEach(h => {
      hostsMap[h.id] = h;
    });

    // הוספת פרטי מארח לכל מודעה
    const listingsWithHostInfo = allListings.map(listing => ({
      ...listing,
      hostName: hostsMap[listing.hostId]?.full_name || hostsMap[listing.hostId]?.email || 'לא ידוע'
    }));

    return Response.json({
      sosCount: sosTickets.length,
      validationQueue: verificationQueue.length,
      revenueThisMonth: Math.round(currentMonthRevenue),
      revenueLastMonth: Math.round(lastMonthRevenue),
      monthlyRevenueData,
      activeHolds: 0,
      totalListings: activeListings.length,
      activeUsers: currentWeekActiveUsers,
      activeUsersLastWeek: lastWeekActiveUsers,
      flaggedChatsCount: flaggedChats.length,
      integrityStats: integrityPercents,
      allListings: listingsWithHostInfo
    });

  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});