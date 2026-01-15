import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, reportReason } = await req.json();

    if (!listingId || !reportReason) {
      return Response.json({ error: 'Missing listingId or reportReason' }, { status: 400 });
    }

    // טעינת המודעה
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    if (!listings || listings.length === 0) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listings[0];

    // שאילת AI להערכת חומרת הדיווח
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `
אתה מערכת הערכת דיווחים על נכסים בפלטפורמת השכרה.
נתת לך דיווח על נכס. עליך להעריך את חומרת הדיווח:

דיווח: "${reportReason}"

החזר JSON במבנה הבא:
{
  "severity": "MINOR" | "MODERATE" | "SEVERE",
  "strikeValue": 0.5 | 1 | 2,
  "reason": "הסבר קצר",
  "requiresImmediateAction": true/false
}

הערות:
- MINOR: בעיה קלה (0.5 נקודות)
- MODERATE: הפרה בינונית (1 נקודה)
- SEVERE: הפרה חמורה (2 נקודות)
      `,
      response_json_schema: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["MINOR", "MODERATE", "SEVERE"] },
          strikeValue: { type: "number" },
          reason: { type: "string" },
          requiresImmediateAction: { type: "boolean" }
        },
        required: ["severity", "strikeValue", "reason"]
      }
    });

    // עדכון מספר ההפרות
    const newViolationCount = (listing.violation_count || 0) + aiResponse.strikeValue;

    await base44.asServiceRole.entities.Listing.update(listingId, {
      violation_count: newViolationCount,
      last_violation_date: new Date().toISOString()
    });

    // בדיקה אם עברנו את הסף של 3
    let actionTaken = null;
    if (newViolationCount >= 3) {
      // הקפאת המודעה
      await base44.asServiceRole.entities.Listing.update(listingId, {
        status: 'SUSPENDED_INVESTIGATION'
      });

      // יצירת Support Ticket למנהל
      await base44.asServiceRole.entities.SupportTicket.create({
        userId: listing.hostId,
        type: 'GENERAL',
        priority: 'CRITICAL',
        status: 'OPEN',
        description: `מודעה הוקפאה אוטומטית עקב 3 הפרות. נדרשת בדיקה ידנית.`,
        adminNotes: `Listing ID: ${listingId}, Total Violations: ${newViolationCount}`
      });

      actionTaken = 'SUSPENDED';
    }

    // רישום ב-Audit Log
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'REPORT_CREATED',
      target_entity_type: 'Listing',
      target_entity_id: listingId,
      metadata: { 
        aiAnalysis: aiResponse,
        newViolationCount,
        actionTaken 
      },
      description: `דיווח נרשם: ${reportReason}`
    });

    return Response.json({
      success: true,
      violationCount: newViolationCount,
      actionTaken,
      aiAnalysis: aiResponse
    });

  } catch (error) {
    console.error('Error in check3StrikeRule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});