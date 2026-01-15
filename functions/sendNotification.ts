import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, type, data } = await req.json();

    if (!userId || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user preferences
    const preferences = await base44.asServiceRole.entities.UserPreferences.filter({ userId });
    const userPrefs = preferences[0] || { emailNotifications: {} };

    // Get user details
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const targetUser = users[0];

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const notifications = [];

    // Map notification type to preference key
    const emailPrefMap = {
      'BOOKING_CONFIRMED': 'bookingConfirmed',
      'CHECK_IN_REMINDER': 'checkInReminder',
      'CHECK_OUT_REMINDER': 'checkOutReminder',
      'PAYMENT_CONFIRMED': 'paymentConfirmed',
      'NEW_MESSAGE': 'newMessage',
      'SOS_ALERT': 'sosAlerts',
      'SUPPORT_TICKET_UPDATE': 'supportTicketUpdates',
      'REVIEW_REQUEST': 'reviewRequest',
      'HOST_BOOKING_REQUEST': 'hostBookingRequest'
    };

    const prefKey = emailPrefMap[type];
    const shouldSendEmail = !prefKey || userPrefs.emailNotifications?.[prefKey] !== false;

    // Send email notification
    if (shouldSendEmail) {
      const emailContent = getEmailContent(type, data);
      
      const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
        to: targetUser.email,
        subject: emailContent.subject,
        body: emailContent.body
      });

      notifications.push({
        channel: 'email',
        sent: true,
        to: targetUser.email
      });
    }

    // SMS for critical notifications only
    const smsPrefMap = {
      'SOS_ALERT': 'sosAlerts',
      'CHECK_IN_REMINDER': 'checkInReminder'
    };

    const smsKey = smsPrefMap[type];
    if (smsKey && userPrefs.smsNotifications?.[smsKey] && userPrefs.phoneNumber) {
      // SMS integration would go here (Twilio/etc)
      notifications.push({
        channel: 'sms',
        sent: false,
        note: 'SMS integration not configured'
      });
    }

    return Response.json({
      success: true,
      notifications,
      message: `Sent ${notifications.length} notification(s)`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getEmailContent(type, data) {
  const templates = {
    'BOOKING_CONFIRMED': {
      subject: '✅ ההזמנה שלך אושרה!',
      body: `שלום ${data.guestName},\n\nההזמנה שלך לדירה "${data.listingTitle}" אושרה!\n\nתאריכי שהייה: ${data.checkIn} - ${data.checkOut}\nסכום כולל: ₪${data.totalPrice}\n\nנשלח אליך מייל נפרד עם פרטי הכניסה 24 שעות לפני הצ'ק-אין.\n\nבהצלחה,\nצוות SIMPLEambo`
    },
    'CHECK_IN_REMINDER': {
      subject: '🔑 תזכורת: הצ\'ק-אין שלך מחר',
      body: `שלום ${data.guestName},\n\nזוהי תזכורת שהצ'ק-אין שלך ל"${data.listingTitle}" מתוכנן למחר.\n\nשעת כניסה: 15:00\nכתובת: ${data.address}\n\nפרטי כניסה:\n${data.checkInInstructions}\n\nאם יש בעיה או שאלה, צור קשר עם המארח או השתמש בצ'אט באפליקציה.\n\nבהצלחה!\nצוות SIMPLEambo`
    },
    'CHECK_OUT_REMINDER': {
      subject: '👋 תזכורת: צ\'ק-אאוט מחר',
      body: `שלום ${data.guestName},\n\nזוהי תזכורת שהצ'ק-אאוט שלך מ"${data.listingTitle}" מתוכנן למחר.\n\nשעת יציאה: 11:00\n\nאנא וודא שהדירה נקייה ומסודרת, וכל הדברים במקומם.\n\nנשמח לקבל ביקורת על השהייה שלך!\n\nתודה,\nצוות SIMPLEambo`
    },
    'PAYMENT_CONFIRMED': {
      subject: '💳 התשלום אושר בהצלחה',
      body: `שלום ${data.userName},\n\nהתשלום שלך בסך ₪${data.amount} אושר בהצלחה.\n\nפרטי עסקה: ${data.transactionId}\nתאריך: ${data.date}\n\nהחשבונית נשלחה אליך במייל נפרד.\n\nתודה,\nצוות SIMPLEambo`
    },
    'NEW_MESSAGE': {
      subject: '💬 קיבלת הודעה חדשה',
      body: `שלום ${data.recipientName},\n\nקיבלת הודעה חדשה מ${data.senderName} לגבי "${data.listingTitle}".\n\nהודעה: "${data.messagePreview}..."\n\nענה בצ'אט באפליקציה.\n\nצוות SIMPLEambo`
    },
    'SOS_ALERT': {
      subject: '🚨 התראת חירום - פרוטוקול SOS הופעל',
      body: `שלום ${data.userName},\n\nפרוטוקול SOS הופעל להזמנה שלך.\n\nדירה: ${data.listingTitle}\nסיבה: ${data.reason}\n\nצוות התמיכה שלנו עובד כרגע על מציאת פתרון. אנחנו ניצור איתך קשר בהקדם.\n\nלפניה דחופה: support@simpleambo.com\n\nצוות SIMPLEambo`
    },
    'SUPPORT_TICKET_UPDATE': {
      subject: '🎫 עדכון בפנייה שלך',
      body: `שלום ${data.userName},\n\nיש עדכון בפנייה #${data.ticketId}.\n\nסטטוס: ${data.status}\n${data.adminNote ? `\nהערת התמיכה: ${data.adminNote}` : ''}\n\nצפה בפרטים באפליקציה.\n\nצוות SIMPLEambo`
    },
    'REVIEW_REQUEST': {
      subject: '⭐ ספר לנו על החוויה שלך',
      body: `שלום ${data.guestName},\n\nתודה ששהית ב"${data.listingTitle}"!\n\nנשמח לשמוע על החוויה שלך - הביקורת שלך עוזרת לאורחים אחרים לקבל החלטות מושכלות.\n\nכתוב ביקורת באפליקציה.\n\nתודה,\nצוות SIMPLEambo`
    },
    'HOST_BOOKING_REQUEST': {
      subject: '🏠 בקשת הזמנה חדשה לנכס שלך',
      body: `שלום ${data.hostName},\n\nקיבלת בקשת הזמנה חדשה לנכס "${data.listingTitle}"!\n\nאורח: ${data.guestName}\nתאריכים: ${data.checkIn} - ${data.checkOut}\nסכום: ₪${data.totalPrice}\n\nאנא אשר או דחה את ההזמנה בתוך 24 שעות.\n\nצוות SIMPLEambo`
    }
  };

  return templates[type] || {
    subject: 'עדכון מ-SIMPLEambo',
    body: 'יש לך עדכון חדש באפליקציה.'
  };
}