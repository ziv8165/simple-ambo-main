import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { messageId } = await req.json();

    if (!messageId) {
      return Response.json({ error: 'Missing messageId' }, { status: 400 });
    }

    // Get message details
    const messages = await base44.asServiceRole.entities.ChatMessage.filter({ id: messageId });
    const message = messages[0];

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    // Get sender, receiver, and listing details
    const [senders, receivers, listings] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ id: message.senderId }),
      base44.asServiceRole.entities.User.filter({ id: message.receiverId }),
      base44.asServiceRole.entities.Listing.filter({ id: message.listingId })
    ]);

    const sender = senders[0];
    const receiver = receivers[0];
    const listing = listings[0];

    if (!sender || !receiver || !listing) {
      return Response.json({ error: 'Related entities not found' }, { status: 404 });
    }

    // Send notification to receiver
    const notificationData = {
      recipientName: receiver.full_name || receiver.email.split('@')[0],
      senderName: sender.full_name || sender.email.split('@')[0],
      listingTitle: listing.title || `${listing.neighborhood}, ${listing.city}`,
      messagePreview: message.message.substring(0, 50)
    };

    await base44.asServiceRole.functions.invoke('sendNotification', {
      userId: message.receiverId,
      type: 'NEW_MESSAGE',
      data: notificationData
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});