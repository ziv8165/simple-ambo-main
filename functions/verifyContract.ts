import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl, userDeclaredRent } = await req.json();

    if (!fileUrl || !userDeclaredRent) {
      return Response.json({ 
        error: 'Missing required fields: fileUrl and userDeclaredRent' 
      }, { status: 400 });
    }

    // שליחה ל-AI לחילוץ מידע מהחוזה
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `
אתה מומחה לבדיקת חוזי שכירות בישראל. נתת לך תמונה של חוזה שכירות.
בדוק את הדברים הבאים:

1. האם זה חוזה אמיתי? (יש כותרת רשמית, תאריכים, חתימות, פרטי צדדים וכו')
2. אם זה נראה פייק או סתם דף ריק - סמן שזה לא תקין
3. חלץ את שכר הדירה החודשי (רק המספר)
4. חלץ את הכתובת (אם יש)

החזר JSON במבנה הבא:
{
  "isValidContract": true/false,
  "monthlyRent": number or null,
  "address": string or null,
  "confidence": number (0-100),
  "reason": "הסבר קצר למה זה תקין או לא תקין"
}

אם החוזה נראה מזויף, לא ברור, ריק, או ללא חתימות/פרטים רשמיים - החזר isValidContract: false.
      `,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          isValidContract: { type: "boolean" },
          monthlyRent: { type: ["number", "null"] },
          address: { type: ["string", "null"] },
          confidence: { type: "number" },
          reason: { type: "string" }
        },
        required: ["isValidContract", "confidence", "reason"]
      }
    });

    const extractedData = aiResponse;

    // בדיקה 1: האם החוזה תקין?
    if (!extractedData.isValidContract) {
      return Response.json({
        status: "INVALID_DOCUMENT",
        reason: extractedData.reason || "המסמך לא נראה כחוזה אמיתי. יש להעלות חוזה עם חתימות, תאריכים ופרטים רשמיים.",
        extractedData
      });
    }

    // בדיקה 2: האם ה-AI הצליח לחלץ מחיר?
    if (!extractedData.monthlyRent) {
      return Response.json({
        status: "MANUAL_REVIEW",
        reason: "לא הצלחתי לזהות את שכר הדירה בחוזה. יש לבדיקה ידנית.",
        extractedData
      });
    }

    // בדיקה 3: השוואת מחירים (סטייה של עד 5%)
    const deviation = Math.abs(extractedData.monthlyRent - userDeclaredRent);
    const deviationPercent = (deviation / userDeclaredRent) * 100;
    const isMatch = deviationPercent < 5;

    if (isMatch) {
      return Response.json({
        status: "APPROVED",
        reason: "אימות עבר בהצלחה! המחיר בחוזה תואם למה שהוזן.",
        extractedData,
        deviation
      });
    } else {
      return Response.json({
        status: "MANUAL_REVIEW",
        reason: `אי התאמה במחיר: בחוזה ${extractedData.monthlyRent}₪, הוזן ${userDeclaredRent}₪`,
        extractedData,
        deviation
      });
    }

  } catch (error) {
    console.error('Error verifying contract:', error);
    return Response.json({ 
      error: error.message,
      status: "ERROR"
    }, { status: 500 });
  }
});