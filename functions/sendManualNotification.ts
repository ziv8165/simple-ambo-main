import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, channel, title, content } = await req.json();

    if (!userId || !channel || !content) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create notification log
    const notification = await base44.asServiceRole.entities.NotificationLog.create({
      userId,
      type: 'ADMIN_MANUAL',
      channel,
      title: title || 'התראה מהנהלה',
      content,
      status: 'SENT',
      metadata: {
        sentBy: user.id,
        sentByName: user.full_name || user.email
      }
    });

    // Here you would integrate with actual notification service (SMS/Email/Push)
    // For now, we're just logging it to the database

    return Response.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error in sendManualNotification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});