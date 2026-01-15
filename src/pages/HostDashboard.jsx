import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  TrendingUp, Eye, MousePointer, ShoppingCart, CheckCircle, 
  AlertCircle, DollarSign, Home, MessageCircle, Edit2, Clock,
  ArrowUp, ArrowDown, Lightbulb, Camera, Image as ImageIcon,
  Trash2, Archive, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ExternalLink, Settings, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PhotoManager from '@/components/listings/PhotoManager';

export default function HostDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [listingsTab, setListingsTab] = useState('active');
  const [photoManagerOpen, setPhotoManagerOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['hostDashboard'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getHostDashboardData', {});
      return response.data;
    },
    refetchInterval: 10000
  });

  // Handle Stripe success callback
  useEffect(() => {
    if (searchParams.get('stripe_success') === 'true') {
      toast.success('חשבון הבנק חובר בהצלחה!');
      queryClient.invalidateQueries(['hostDashboard']);
    }
  }, [searchParams]);

  const archiveListingMutation = useMutation({
    mutationFn: (listingId) => base44.entities.Listing.update(listingId, { 
      status: 'ARCHIVED',
      removed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('הנכס הועבר לארכיון');
      queryClient.invalidateQueries(['hostDashboard']);
    }
  });

  const deleteListingMutation = useMutation({
    mutationFn: (listingId) => base44.entities.Listing.update(listingId, { 
      status: 'REMOVED',
      removed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('הנכס סומן למחיקה (יימחק לאחר 30 יום)');
      queryClient.invalidateQueries(['hostDashboard']);
    }
  });

  const restoreListingMutation = useMutation({
    mutationFn: (listingId) => base44.entities.Listing.update(listingId, {
      status: 'PENDING_REVIEW',
      removed_at: null
    }),
    onSuccess: () => {
      toast.success('הנכס שוחזר ונשלח לבדיקה מחדש');
      queryClient.invalidateQueries(['hostDashboard']);
    }
  });

  const activateListingMutation = useMutation({
    mutationFn: (listingId) => base44.entities.Listing.update(listingId, {
      status: 'ACTIVE',
      removed_at: null
    }),
    onSuccess: () => {
      toast.success('הנכס חזר לפעיל');
      queryClient.invalidateQueries(['hostDashboard']);
    }
  });

  const archiveFromRemovedMutation = useMutation({
    mutationFn: (listingId) => base44.entities.Listing.update(listingId, {
      status: 'ARCHIVED',
      removed_at: null
    }),
    onSuccess: () => {
      toast.success('הנכס הועבר לארכיון');
      queryClient.invalidateQueries(['hostDashboard']);
    }
  });

  const connectStripeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('stripeConnectOnboarding', {
        action: 'create_account'
      });
      return response.data;
    },
    onSuccess: (data) => {
      window.location.href = data.onboardingUrl;
    },
    onError: () => {
      toast.error('שגיאה בחיבור לחשבון בנק');
    }
  });

  const createPayoutMutation = useMutation({
    mutationFn: async (amount) => {
      const response = await base44.functions.invoke('stripeConnectOnboarding', {
        action: 'create_payout',
        amount
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('הכסף בדרך לחשבון הבנק שלך');
      queryClient.invalidateQueries(['hostDashboard']);
    },
    onError: () => {
      toast.error('שגיאה במשיכת כספים');
    }
  });

  const handleManagePhotos = (listing) => {
    setSelectedListing(listing);
    setPhotoManagerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const aiSuggestions = dashboardData?.aiSuggestions || [];
  const myListings = dashboardData?.myListings || {};
  const wallet = dashboardData?.wallet || {};
  const paymentHistory = dashboardData?.paymentHistory || [];

  const ListingCard = ({ listing, showActions = true }) => {
    // Check if this is a final rejection by admin (REMOVED with admin feedback)
    const isFinalRejection = listing.status === 'REMOVED' && listing.admin_feedback && listing.admin_feedback.length > 0;

    return (
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-all">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
          {listing.photos?.[0] ? (
            <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400 m-auto mt-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{listing.title || 'ללא כותרת'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {listing.status === 'PENDING_REVIEW' && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">ממתין לאישור</Badge>
            )}
            {listing.status === 'CHANGES_REQUESTED' && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">נדרש תיקון</Badge>
            )}
            {listing.status === 'READY_FOR_PRICING' && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">מוכן לתמחור</Badge>
            )}
            {listing.status === 'ACTIVE' && (
              <Badge className="bg-green-100 text-green-800 text-xs">פעיל</Badge>
            )}
            {listing.status === 'ARCHIVED' && (
              <Badge className="bg-gray-100 text-gray-800 text-xs">בארכיון</Badge>
            )}
            {listing.status === 'REMOVED' && (
              <Badge className="bg-red-100 text-red-800 text-xs">{isFinalRejection ? 'נדחה על ידי מנהל' : 'הוסר'}</Badge>
            )}
            {listing.pricePerNight && (
              <span className="text-sm text-gray-600">₪{listing.pricePerNight}/לילה</span>
            )}
          </div>
          {listing.admin_feedback && listing.admin_feedback.length > 0 && (
            <p className="text-xs text-orange-600 mt-2 bg-orange-50 rounded px-2 py-1">
              {listing.admin_feedback[0]}
            </p>
          )}
          {listing.admin_section_feedback && Object.keys(listing.admin_section_feedback).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(listing.admin_section_feedback).map(([section, feedback]) => {
                const sectionNames = {
                  title: 'כותרת',
                  summary: 'תיאור',
                  the_space: 'פרטי נכס',
                  photos: 'תמונות',
                  pricePerNight: 'מחיר',
                  location: 'מיקום',
                };
                return feedback ? (
                  <div key={section} className="text-xs bg-red-50 border border-red-200 rounded px-2 py-1">
                    <span className="font-bold text-red-800">{sectionNames[section]}:</span>{' '}
                    <span className="text-red-700">{feedback}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(createPageUrl('ListingDetails') + `?id=${listing.id}`)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {listing.status === 'CHANGES_REQUESTED' && (
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => navigate(createPageUrl('CreateListing') + `?edit=${listing.id}`)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleManagePhotos(listing)}
            >
              <Camera className="w-4 h-4" />
            </Button>
            {listing.status === 'ACTIVE' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => archiveListingMutation.mutate(listing.id)}
              >
                <Archive className="w-4 h-4" />
              </Button>
            )}
            {listing.status === 'ARCHIVED' && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => activateListingMutation.mutate(listing.id)}
                disabled={activateListingMutation.isPending}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {(listing.status === 'ARCHIVED' || listing.status === 'ACTIVE') && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  if (confirm('האם אתה בטוח? הנכס יימחק לאחר 30 יום.')) {
                    deleteListingMutation.mutate(listing.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {listing.status === 'REMOVED' && !isFinalRejection && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => restoreListingMutation.mutate(listing.id)}
                  disabled={restoreListingMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => archiveFromRemovedMutation.mutate(listing.id)}
                  disabled={archiveFromRemovedMutation.isPending}
                >
                  <Archive className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">דשבורד מארח</h1>
            <p className="text-gray-500 mt-1">ניהול מלא של העסק שלך במקום אחד</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('CreateListing'))}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Home className="w-4 h-4 ml-2" />
            הוסף נכס חדש
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="listings">הנכסים שלי ({Object.values(myListings).flat().length})</TabsTrigger>
            <TabsTrigger value="wallet">ארנק</TabsTrigger>
            <TabsTrigger value="messages">הודעות</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">💡 המלצות AI לשיפור ביצועים</h3>
                    <div className="space-y-2">
                      {aiSuggestions.slice(0, 2).map((suggestion, idx) => (
                        <div key={idx} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-sm">{suggestion.message}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-white hover:bg-white/20"
                            onClick={() => setActiveTab('listings')}
                          >
                            {suggestion.action} →
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  משפך המרות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{stats.views?.toLocaleString() || 0}</p>
                    <p className="text-xs text-blue-700">חשיפות</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <MousePointer className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{stats.clicks?.toLocaleString() || 0}</p>
                    <p className="text-xs text-green-700">קליקים</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <ShoppingCart className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-900">{stats.checkoutStarted || 0}</p>
                    <p className="text-xs text-yellow-700">לפני סליקה</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{stats.bookingsCompleted || 0}</p>
                    <p className="text-xs text-purple-700">הושלמו</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    שיעור המרה: <span className="font-bold text-gray-900">{stats.conversionRate || '0'}%</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Wallet Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">זמין למשיכה</p>
                      <p className="text-2xl font-bold text-green-600">₪{wallet.available?.toLocaleString() || 0}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">בהמתנה</p>
                      <p className="text-2xl font-bold text-gray-700">₪{wallet.pending?.toLocaleString() || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">סה"כ הכנסות</p>
                      <p className="text-2xl font-bold text-blue-600">₪{wallet.lifetimeEarnings?.toLocaleString() || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <Tabs value={listingsTab} onValueChange={setListingsTab}>
              <TabsList className="bg-white">
                <TabsTrigger value="active">
                  פעיל ({myListings.active?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  בהמתנה ({myListings.pending?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="archived">
                  ארכיון ({myListings.archived?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="removed">
                  הוסר ({myListings.removed?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3">
                {myListings.active?.length > 0 ? (
                  myListings.active.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      אין נכסים פעילים
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {myListings.pending?.length > 0 ? (
                  myListings.pending.map(listing => (
                    <ListingCard key={listing.id} listing={listing} showActions={false} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      אין נכסים ממתינים
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="archived" className="space-y-3">
                {myListings.archived?.length > 0 ? (
                  myListings.archived.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      אין נכסים בארכיון
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="removed" className="space-y-3">
                {myListings.removed?.length > 0 ? (
                  myListings.removed.map(listing => {
                    const isFinalRejection = listing.admin_feedback && listing.admin_feedback.length > 0;

                    return (
                      <div key={listing.id} className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                            {listing.photos?.[0] ? (
                              <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-400 m-auto mt-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <p className="font-semibold text-red-900">{listing.title || 'ללא כותרת'}</p>
                            </div>

                            {isFinalRejection ? (
                              <>
                                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                                  <p className="text-sm font-bold text-red-900 mb-1">המודעה נדחתה על ידי מנהל:</p>
                                  <p className="text-sm text-red-800">{listing.admin_feedback[0]}</p>
                                </div>
                                <p className="text-sm text-red-700 mb-3">
                                  המודעה תימחק לצמיתות ב-{new Date(new Date(listing.removed_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(createPageUrl('ListingDetails') + `?id=${listing.id}`)}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    צפייה
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-red-700 mb-3">
                                  הנכס יימחק לצמיתות ב-{new Date(new Date(listing.removed_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(createPageUrl('ListingDetails') + `?id=${listing.id}`)}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    צפייה
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => restoreListingMutation.mutate(listing.id)}
                                    disabled={restoreListingMutation.isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4 ml-2" />
                                    שחזור
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => archiveFromRemovedMutation.mutate(listing.id)}
                                    disabled={archiveFromRemovedMutation.isPending}
                                  >
                                    <Archive className="w-4 h-4 ml-2" />
                                    העבר לארכיון
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      אין נכסים שהוסרו
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            {/* Stripe Connection Status */}
            {!wallet.stripeConnected ? (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-orange-600 mx-auto" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">חבר חשבון בנק לקבלת כספים</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        כדי לקבל תשלומים, עליך לחבר את חשבון הבנק שלך דרך Stripe
                      </p>
                      <Button
                        onClick={() => connectStripeMutation.mutate()}
                        disabled={connectStripeMutation.isPending}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {connectStripeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <ExternalLink className="w-4 h-4 ml-2" />
                        )}
                        חבר חשבון בנק 🏦
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Wallet Widget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">זמין למשיכה</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">₪{wallet.available?.toLocaleString() || 0}</p>
                      <Button
                        onClick={() => createPayoutMutation.mutate(wallet.available)}
                        disabled={wallet.available <= 0 || createPayoutMutation.isPending}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      >
                        {createPayoutMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : null}
                        משוך לבנק
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">בהמתנה</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-700">₪{wallet.pending?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        כסף זה ישוחרר 24 שעות לאחר צ'ק-אין
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">סה"כ הכנסות</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-blue-600">₪{wallet.lifetimeEarnings?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        מאז ההצטרפות
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment History */}
                <Card>
                  <CardHeader>
                    <CardTitle>היסטוריית תשלומים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentHistory.length > 0 ? (
                      <div className="space-y-2">
                        {paymentHistory.map(payment => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">₪{payment.amount?.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{payment.description || payment.type}</p>
                            </div>
                            <div className="text-left">
                              <Badge className={
                                payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {payment.status === 'COMPLETED' ? 'הושלם' :
                                 payment.status === 'PENDING' ? 'בהמתנה' : payment.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(payment.date).toLocaleDateString('he-IL')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">אין תשלומים עדיין</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">תיבת ההודעות שלך</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      כל ההודעות מאורחים ומהנהלה במקום אחד
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl('Chat'))}
                      variant="outline"
                    >
                      פתח תיבת דואר
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Photo Manager Modal */}
        {selectedListing && (
          <PhotoManager
            open={photoManagerOpen}
            onClose={() => {
              setPhotoManagerOpen(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
            onUpdate={() => {
              queryClient.invalidateQueries(['hostDashboard']);
            }}
          />
        )}
      </div>
    </div>
  );
}