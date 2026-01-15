import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, messageText } = await req.json();

    if (!messageId || !messageText) {
      return Response.json({ error: 'Missing messageId or messageText' }, { status: 400 });
    }

    // שליחה ל-AI לניתוח ההודעה
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `
אתה מערכת זיהוי תוכן חשוד בפלטפורמת השכרה.
נתת לך הודעת צ'אט. עליך לזהות האם ההודעה מכילה:

1. מספרי טלפון (בכל פורמט)
2. כתובות מייל
3. קישורים חיצוניים
4. בקשות תשלום מחוץ לפלטפורמה
5. הצעות לעסקאות עוקפות פלטפורמה

החזר JSON במבנה הבא:
{
  "isSuspicious": true/false,
  "reason": "הסבר קצר אם חשוד",
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "detectedPatterns": ["phone_number", "email", "external_payment"]
}

הודעה לבדיקה:
"${messageText}"
      `,
      response_json_schema: {
        type: "object",
        properties: {
          isSuspicious: { type: "boolean" },
          reason: { type: "string" },
          severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          detectedPatterns: { type: "array", items: { type: "string" } }
        },
        required: ["isSuspicious", "severity"]
      }
    });

    // עדכון ההודעה במאגר
    if (aiResponse.isSuspicious) {
      await base44.asServiceRole.entities.ChatMessage.update(messageId, {
        isFlagged: true,
        flagReason: aiResponse.reason,
        aiAnalysis: aiResponse
      });

      // יצירת Support Ticket אם הסכנה גבוהה
      if (aiResponse.severity === 'HIGH') {
        await base44.asServiceRole.entities.SupportTicket.create({
          userId: user.id,
          type: 'GENERAL',
          priority: 'HIGH',
          status: 'OPEN',
          description: `הודעה חשודה זוהתה בצ'אט. סיבה: ${aiResponse.reason}`,
          adminNotes: `Message ID: ${messageId}`
        });
      }

      // רישום ב-Audit Log
      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'CHAT_FLAGGED',
        target_entity_type: 'ChatMessage',
        target_entity_id: messageId,
        metadata: { aiAnalysis: aiResponse },
        description: `הודעה סומנה כחשודה: ${aiResponse.reason}`
      });
    }

    return Response.json({
      success: true,
      flagged: aiResponse.isSuspicious,
      analysis: aiResponse
    });

  } catch (error) {
    console.error('Error in monitorChatMessage:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});