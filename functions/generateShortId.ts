import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // שליפת כל המודעות שאין להן short_id
    const listings = await base44.asServiceRole.entities.Listing.list();
    const listingsWithoutShortId = listings.filter(l => !l.short_id);

    let updatedCount = 0;

    for (const listing of listingsWithoutShortId) {
      // יצירת short_id ייחודי
      let shortId;
      let isUnique = false;
      
      while (!isUnique) {
        // יוצר ID בפורמט: 2 אותיות + 4 ספרות (לדוגמה: AB1234)
        const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const numbers = Math.floor(1000 + Math.random() * 9000);
        shortId = `${letters}${numbers}`;
        
        // בדיקה שה-ID ייחודי
        const existing = await base44.asServiceRole.entities.Listing.filter({ short_id: shortId });
        if (existing.length === 0) {
          isUnique = true;
        }
      }

      // עדכון המודעה עם ה-short_id
      await base44.asServiceRole.entities.Listing.update(listing.id, { short_id: shortId });
      updatedCount++;
    }

    return Response.json({
      success: true,
      message: `עודכנו ${updatedCount} מודעות עם מזהה קצר`,
      updatedCount
    });

  } catch (error) {
    console.error('Error in generateShortId:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});