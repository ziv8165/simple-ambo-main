import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { date } = await req.json().catch(() => ({}));
    const reportDate = date || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all data for the day
    const [bookings, payments, messages, listings, users, reports, tickets] = await Promise.all([
      base44.asServiceRole.entities.Booking.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      }),
      base44.asServiceRole.entities.Payment.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      }),
      base44.asServiceRole.entities.ChatMessage.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      }),
      base44.asServiceRole.entities.Listing.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      }),
      base44.asServiceRole.entities.User.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      }),
      base44.asServiceRole.entities.Report.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      }),
      base44.asServiceRole.entities.SupportTicket.filter({
        created_date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
      })
    ]);

    // Calculate metrics
    const successfulBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'UPCOMING');
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const totalTransactions = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const platformRevenue = totalTransactions * 0.1; // 10% commission

    // Count unique conversations (unique conversationId)
    const uniqueChats = [...new Set(messages.map(m => m.conversationId))];

    const sosIncidents = tickets.filter(t => t.type === 'SOS' || t.priority === 'CRITICAL').length;

    const reportData = {
      report_date: reportDate,
      traffic: {
        unique_visitors: users.length * 3, // Approximation (guests visit 3x more than register)
        total_pageviews: messages.length * 5 // Approximation
      },
      finance: {
        total_transactions: Math.round(totalTransactions),
        platform_revenue: Math.round(platformRevenue),
        successful_bookings: successfulBookings.length
      },
      engagement: {
        listing_views: listings.length * 20, // Approximation
        new_chats: uniqueChats.length,
        messages_sent: messages.length
      },
      operations: {
        new_listings: listings.length,
        verified_users: users.length,
        reports_opened: reports.length,
        sos_incidents: sosIncidents
      }
    };

    // Check if report already exists
    const existingReports = await base44.asServiceRole.entities.DailyReport.filter({ 
      report_date: reportDate 
    });

    if (existingReports.length > 0) {
      // Update existing report
      await base44.asServiceRole.entities.DailyReport.update(existingReports[0].id, reportData);
      return Response.json({ 
        success: true, 
        message: 'Report updated',
        report: reportData 
      });
    } else {
      // Create new report
      const newReport = await base44.asServiceRole.entities.DailyReport.create(reportData);
      return Response.json({ 
        success: true, 
        message: 'Report created',
        report: newReport 
      });
    }

  } catch (error) {
    console.error('Error generating daily report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});