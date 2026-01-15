import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, CheckCircle, AlertTriangle, XCircle, HelpCircle, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FeedbackBubble from '@/components/feedback/FeedbackBubble';

export default function PricingStep({ data, updateData, adminFeedback = {}, isAdminMode = false }) {
  const [loading, setLoading] = useState(false);
  const [estimatedRent, setEstimatedRent] = useState(data.estimatedMonthlyRent ? { estimated_rent: data.estimatedMonthlyRent } : null);
  const [rentConfirmed, setRentConfirmed] = useState(!!data.pricePerNight);
  const [pricing, setPricing] = useState(null);
  const [userPrice, setUserPrice] = useState(data.pricePerNight ? data.pricePerNight.toString() : '');
  const [manualRent, setManualRent] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [needsProof, setNeedsProof] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // בדיקה אם המחיר חורג מהטווח המקסימלי (לא במצב מנהל)
  const checkIfNeedsProof = (rentAmount) => {
    if (isAdminMode) return false; // מנהל יכול להזין כל מחיר
    
    const maxLimits = {
      shared_room: { tlv_heart: 5000, old_north: 5000, south_jaffa: 4000, ramat_aviv: 4500 },
      studio: { tlv_heart: 7000, old_north: 7000, south_jaffa: 5500, ramat_aviv: 7000 },
      standard_apt: {
        1: { tlv_heart: 7000, old_north: 7000, south_jaffa: 5500, ramat_aviv: 7000 },
        2: { tlv_heart: 9500, old_north: 9500, south_jaffa: 7200, ramat_aviv: 8000 },
        3: { tlv_heart: 13000, old_north: 13000, south_jaffa: 9000, ramat_aviv: 10500 },
        4: { tlv_heart: 18000, old_north: 18000, south_jaffa: 12000, ramat_aviv: 15000 },
        5: { tlv_heart: 18000, old_north: 18000, south_jaffa: 12000, ramat_aviv: 15000 }
      }
    };

    const assetType = data.assetType || 'standard_apt';
    const zone = data.zone || 'south_jaffa';
    const bedrooms = data.bedrooms || 1;

    let maxLimit = 0;
    if (assetType === 'standard_apt' && maxLimits[assetType][bedrooms]) {
      maxLimit = maxLimits[assetType][bedrooms][zone] || 0;
    } else if (maxLimits[assetType]) {
      maxLimit = maxLimits[assetType][zone] || 0;
    }

    return rentAmount > maxLimit;
  };

  // שלב 1: הערכת שכר דירה
  const estimateRent = async () => {
    setLoading(true);
    try {
      // If no zone is selected, alert the user or default?
      // We should ideally prevent reaching this step without a zone, but for now fallback is needed
      // However, user specifically complained about the fallback.
      // Since we added zone selection in LocationStep, data.zone should be present.

      const response = await base44.functions.invoke('calculateFairPrice', {
        action: 'estimate_rent',
        data: {
          zoneId: data.zone || 'south_jaffa', 
          rooms: data.bedrooms || 1,
          assetType: data.assetType || 'standard_apt',
          features: {
            has_parking: data.has_parking || false,
            is_renovated: data.isRenovated || false
          }
        }
      });

      setEstimatedRent(response.data);
    } catch (error) {
      console.error('Error estimating rent:', error);
    } finally {
      setLoading(false);
    }
  };

  // שלב 2: חישוב מחיר ללילה
  const calculatePricing = async (rent) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('calculateFairPrice', {
        action: 'calculate_price',
        data: {
          verifiedRent: rent,
          checkInDate: data.availableFrom || new Date().toISOString()
        }
      });

      setPricing(response.data);
      setUserPrice(response.data.recommended.toString());
      
      // שמירה אוטומטית
      updateData({ 
        pricePerNight: response.data.recommended,
        estimatedMonthlyRent: rent
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  // טעינה ראשונית אוטומטית
  useEffect(() => {
    if (!estimatedRent) {
      estimateRent();
    } else if (estimatedRent && !pricing && rentConfirmed) {
      calculatePricing(estimatedRent.estimated_rent);
    }
  }, []);

  // שמירה אוטומטית כשמשנים מחיר
  useEffect(() => {
    if (userPrice && pricing) {
      updateData({ 
        pricePerNight: parseInt(userPrice),
        estimatedMonthlyRent: estimatedRent?.estimated_rent || data.estimatedMonthlyRent
      });
    }
  }, [userPrice]);

  // טיפול בהעלאת הוכחה ואימות אוטומטי
  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    setVerificationResult(null);
    
    try {
      // העלאת הקובץ
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProofFile(file_url);
      
      // אימות אוטומטי של החוזה
      const rentToVerify = manualRent ? parseInt(manualRent) : estimatedRent?.estimated_rent;
      
      if (rentToVerify) {
        const verification = await base44.functions.invoke('verifyContract', {
          fileUrl: file_url,
          userDeclaredRent: rentToVerify
        });

        setVerificationResult(verification.data);

        if (verification.data.status === 'APPROVED') {
          // אימות עבר - מאפשרים להמשיך
          setNeedsProof(false);
          if (manualRent) {
            await calculatePricing(parseInt(manualRent));
            setRentConfirmed(true);
          }
        } else if (verification.data.status === 'INVALID_DOCUMENT') {
          // המסמך לא תקין - מחייבים להעלות מסמך אחר
          setProofFile(null);
        }
        // אם MANUAL_REVIEW או ERROR - משאירים את המסמך למנהל לבדוק
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      setVerificationResult({
        status: 'ERROR',
        reason: 'שגיאה בעת אימות המסמך. אנא נסה שוב.'
      });
    } finally {
      setUploadingProof(false);
    }
  };

  // חישוב מחדש עם מחיר ידני
  const handleManualRentConfirm = () => {
    const rent = parseInt(manualRent);
    if (manualRent && rent > 0) {
      const requiresProof = checkIfNeedsProof(rent);
      setNeedsProof(requiresProof);
      
      if (!requiresProof || proofFile) {
        calculatePricing(rent);
        setRentConfirmed(true);
      }
    }
  };

  // פונקציה לקביעת צבע המד
  const getPriceStatus = () => {
    if (!pricing || !userPrice) return 'neutral';
    
    const price = parseInt(userPrice);
    const { min_limit, recommended, max_limit } = pricing;

    if (price >= min_limit && price <= recommended * 1.1) return 'good';
    if (price > recommended * 1.1 && price <= max_limit) return 'warning';
    return 'danger';
  };

  const priceStatus = getPriceStatus();



  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#4A2525] mb-2">תמחור הוגן</h2>
        <p className="text-[#4A2525]/70">
          {isAdminMode ? 'עריכת מחיר ללא הגבלות' : 'נעזור לך לקבוע מחיר שמכסה את ההוצאות ומושך דיירים'}
        </p>
      </div>

      {adminFeedback.pricing && (
        <div className="mb-6">
          <FeedbackBubble feedback={adminFeedback.pricing} />
        </div>
      )}

      {isAdminMode && (
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>מחיר ללילה (₪)</Label>
              <Input
                type="number"
                value={data.pricePerNight || ''}
                onChange={(e) => updateData({ pricePerNight: parseInt(e.target.value) || 0 })}
                className="text-2xl font-bold"
                placeholder="0"
              />
            </div>
            <div>
              <Label>שכר דירה חודשי מוצהר (₪)</Label>
              <Input
                type="number"
                value={data.user_declared_rent || ''}
                onChange={(e) => updateData({ user_declared_rent: parseInt(e.target.value) || 0 })}
                className="text-xl"
                placeholder="0"
              />
            </div>
            <p className="text-sm text-purple-700">
              ⚡ מצב מנהל: אתה יכול להזין כל מחיר ללא הגבלות או אימותים
            </p>
          </CardContent>
        </Card>
      )}

      {/* שלב 1: אישור שכר דירה */}
      {!isAdminMode && !rentConfirmed && (
        <Card className="border-2 border-[#BC5D34]/20">
          <CardHeader>
            <CardTitle className="text-xl">שלב 1: אימות שכר דירה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#BC5D34]" />
              </div>
            ) : estimatedRent ? (
              <>
                <div className="bg-[#E6DDD0]/30 rounded-xl p-6 text-center">
                  <p className="text-sm text-[#4A2525]/70 mb-2">שכר דירה מוערך ל{estimatedRent.zone_name}:</p>
                  <p className="text-4xl font-bold text-[#BC5D34]">
                    ₪{estimatedRent.estimated_rent.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#4A2525]/60 mt-2">לחודש</p>
                </div>

                <div className="space-y-2 text-sm text-[#4A2525]/70">
                  <p>חישוב מבוסס על:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>{estimatedRent.breakdown.rooms} חדרים באזור {estimatedRent.zone_name}</li>
                    <li>מחיר בסיס: ₪{estimatedRent.breakdown.base_per_room} לחדר</li>
                    {estimatedRent.breakdown.features.has_parking && <li>+ חניה</li>}
                    {estimatedRent.breakdown.features.is_renovated && <li>+ משופצת</li>}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={async () => {
                        setRentConfirmed(true);
                        await calculatePricing(estimatedRent.estimated_rent);
                      }}
                      className="flex-1 bg-[#BC5D34] hover:bg-[#A04D2A]"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      מדויק, המשך
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowManualInput(!showManualInput)}
                      className="flex-1"
                    >
                      לא מסכים? הזן ידנית
                    </Button>
                  </div>

                  {showManualInput && (
                    <Card className="bg-[#E6DDD0]/20 border-[#BC5D34]/30">
                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <Label>הזן את שכר הדירה החודשי שלך</Label>
                          <Input
                            type="number"
                            value={manualRent}
                            onChange={(e) => setManualRent(e.target.value)}
                            placeholder="לדוגמה: 6500"
                            className="mt-1"
                          />
                        </div>

                        {needsProof && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800 mb-2">
                              ⚠️ המחיר שהזנת חורג מהטווח המקסימלי באזור. יש להעלות הוכחה (תלוש שכר/חוזה).
                            </p>
                          </div>
                        )}

                        {verificationResult && (
                          <div className={`rounded-lg p-3 ${
                            verificationResult.status === 'APPROVED' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-yellow-50 border border-yellow-200'
                          }`}>
                            {verificationResult.status === 'APPROVED' ? (
                              <p className="text-sm text-green-800">
                                ✅ המסמך אומת בהצלחה!
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-yellow-800">
                                  ⏳ המסמך דורש בדיקה ידנית על ידי הנהלה
                                </p>
                                <Button
                                  onClick={() => {
                                    // שמירת פרטי האימות לבדיקה ידנית
                                    updateData({
                                      contractVerificationDetails: {
                                        status: 'PENDING_ADMIN_REVIEW',
                                        fileUrl: proofFile,
                                        verificationResult: verificationResult,
                                        userDeclaredRent: manualRent ? parseInt(manualRent) : estimatedRent?.estimated_rent,
                                        submittedAt: new Date().toISOString()
                                      }
                                    });
                                    // מאפשרים להמשיך
                                    if (manualRent) {
                                      calculatePricing(parseInt(manualRent));
                                      setRentConfirmed(true);
                                    }
                                  }}
                                  variant="outline"
                                  className="w-full text-xs"
                                >
                                  שלח לבדיקה ידנית והמשך
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {(!needsProof || manualRent) && (
                          <div className="space-y-2">
                            <Label className="text-xs text-[#4A2525]/70">
                              {needsProof ? 'העלה תלוש שכר או חוזה (חובה)' : 'רוצה להוכיח? העלה תלוש שכר או קבלה (אופציונלי)'}
                            </Label>
                            <div className="relative">
                              <input
                                type="file"
                                onChange={handleProofUpload}
                                accept="image/*,.pdf"
                                className="hidden"
                                id="proof-upload"
                              />
                              <label
                                htmlFor="proof-upload"
                                className={`flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#BC5D34]/5 transition-colors ${
                                  needsProof ? 'border-yellow-400 bg-yellow-50' : 'border-[#BC5D34]/40'
                                }`}
                              >
                                {uploadingProof ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm">
                                      {proofFile ? 'הוכחה הועלתה ✓' : 'העלה מסמך'}
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleManualRentConfirm}
                          disabled={
                            !manualRent || 
                            uploadingProof || 
                            (needsProof && !proofFile)
                          }
                          className="w-full bg-[#BC5D34] hover:bg-[#A04D2A]"
                        >
                          {uploadingProof ? 'מאמת מסמך...' : 'חשב מחדש עם המחיר שלי'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Button onClick={estimateRent} className="w-full">
                הערך שכר דירה
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* שלב 2: קביעת מחיר ללילה */}
      {!isAdminMode && rentConfirmed && pricing && (
        <>
          <Card className="border-2 border-[#BC5D34]/20">
            <CardHeader>
              <CardTitle className="text-xl">שלב 2: מחיר מומלץ ללילה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* המד הויזואלי */}
              <div className="relative">
                <div className="h-8 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-green-500"></div>
                  <div className="flex-1 bg-yellow-500"></div>
                  <div className="flex-1 bg-red-500"></div>
                </div>
                
                <div className="flex justify-between text-xs text-[#4A2525]/60 mt-2">
                  <span>₪{pricing.min_limit}</span>
                  <span className="font-bold text-[#BC5D34]">₪{pricing.recommended}</span>
                  <span>₪{pricing.max_limit}</span>
                </div>

                {/* חץ מצביע */}
                {userPrice && (
                  <div 
                    className="absolute top-0 w-0.5 h-10 bg-[#4A2525] transition-all"
                    style={{
                      right: `${Math.min(100, Math.max(0, 
                        ((parseInt(userPrice) - pricing.min_limit) / 
                        (pricing.max_limit - pricing.min_limit)) * 100
                      ))}%`,
                      transform: 'translateX(50%)'
                    }}
                  >
                    <div className="absolute -top-2 right-1/2 translate-x-1/2 w-4 h-4 bg-[#4A2525] rotate-45"></div>
                  </div>
                )}
              </div>

              {/* הסבר */}
              <div className="bg-[#E6DDD0]/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-[#4A2525]/80 flex-1">{pricing.explanation}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-[#4A2525]/60 cursor-pointer flex-shrink-0 mt-0.5" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 text-sm bg-[#E6DDD0] border border-[#4A2525]/20 rounded-md shadow-lg" dir="rtl">
                        <p className="font-semibold mb-1">כיצד מחושב המחיר?</p>
                        <p>המחיר מבוסס על עלות התחזוקה היומית של הנכס (חשמל, מים, ארנונה, וכו') בתוספת מקדם עונתיות של 40% שמושפע מהביקוש בתקופה הנוכחית.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* אינדיקטור סטטוס */}
              <div className="flex items-start gap-3">
                {priceStatus === 'good' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700">מחיר מצוין!</p>
                      <p className="text-sm text-[#4A2525]/70">המחיר שבחרת יכסה את ההוצאות וימשוך דיירים</p>
                    </div>
                  </>
                )}
                {priceStatus === 'warning' && (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700">מחיר גבוה מעט</p>
                      <p className="text-sm text-[#4A2525]/70">החשיפה שלך עלולה לרדת. שקול להוריד מעט</p>
                    </div>
                  </>
                )}
                {priceStatus === 'danger' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700">מחיר גבוה מדי</p>
                      <p className="text-sm text-[#4A2525]/70">המחיר חורג מהטווח המקובל באזור</p>
                    </div>
                  </>
                )}
              </div>

              {/* קלט מחיר */}
              <div className="space-y-2">
                <Label>המחיר שלך ללילה</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={userPrice}
                    onChange={(e) => setUserPrice(e.target.value)}
                    className="text-2xl font-bold pr-12"
                    placeholder={pricing.recommended.toString()}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A2525]/60">₪</span>
                </div>
              </div>

              {/* פירוט */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-[#4A2525]/60 mb-1">עלות יומית בסיסית</p>
                  <p className="font-bold text-[#4A2525]">₪{pricing.daily_base_cost}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-[#4A2525]/60 mb-1">מקדם עונתיות</p>
                  <p className="font-bold text-[#4A2525]">×{pricing.seasonal_multiplier.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>


        </>
      )}
    </div>
  );
}