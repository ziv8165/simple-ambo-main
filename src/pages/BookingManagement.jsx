import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, DollarSign, Shield, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BookingManagement() {
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (booking) => {
      // 1. Update booking status
      await base44.entities.Booking.update(booking.id, {
        status: 'CANCELLED'
      });

      // 2. Get host data
      const host = users.find(u => u.id === booking.hostId);
      if (!host) throw new Error('Host not found');

      // 3. Process host cancellation logic
      const newStrikes = (host.cancellationStrikes || 0) + 1;
      let newRankingScore = host.rankingScore || 1.0;
      let accountStatus = 'active';

      if (newStrikes === 2) {
        newRankingScore = 0.5; // Reduce ranking
      } else if (newStrikes >= 3) {
        accountStatus = 'suspended'; // Suspend account
      }

      // 4. Update host profile
      await base44.entities.User.update(host.id, {
        cancellationStrikes: newStrikes,
        rankingScore: newRankingScore
      });

      // 5. Block dates on listing (mark in listing data)
      const listing = listings.find(l => l.id === booking.listingId);
      if (listing) {
        const blockedDates = listing.blockedDates || [];
        await base44.entities.Listing.update(listing.id, {
          blockedDates: [
            ...blockedDates,
            {
              start: booking.dates.start,
              end: booking.dates.end,
              reason: 'HOST_CANCELLATION'
            }
          ]
        });
      }

      return { newStrikes, newRankingScore, accountStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      
      let message = `ההזמנה בוטלה. המארח קיבל ${data.newStrikes} strikes.`;
      if (data.newStrikes === 1) {
        message += ' אזהרה ראשונה - התאריכים נחסמו.';
      } else if (data.newStrikes === 2) {
        message += ' אזהרה שניה - דירוג הופחת ל-0.5.';
      } else if (data.newStrikes >= 3) {
        message += ' החשבון הוקפא!';
      }
      
      toast.success(message);
      setCancellingBooking(null);
    },
    onError: (error) => {
      toast.error('שגיאה בביטול: ' + error.message);
    }
  });

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getHostInfo = (hostId) => {
    const host = users.find(u => u.id === hostId);
    return host || { email: 'Unknown', cancellationStrikes: 0, rankingScore: 1.0 };
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-[#BC5D34]" />
          <h1 className="text-3xl font-bold text-[#4A2525]" style={{ fontFamily: 'League Spartan, sans-serif' }}>ניהול הזמנות</h1>
        </div>

        {/* Host Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {users.filter(u => u.cancellationStrikes > 0 || u.rankingScore < 1.0).map(user => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-[#422525]/60">מארח</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                      <AlertCircle className="w-3 h-3" />
                      {user.cancellationStrikes || 0} Strikes
                    </div>
                    <div className="text-xs text-[#422525]/60">
                      Ranking: {(user.rankingScore || 1.0).toFixed(1)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 && (
            <div className="text-center py-16 text-[#422525]/60">
              אין הזמנות במערכת
            </div>
          )}

          {bookings.map(booking => {
            const host = getHostInfo(booking.hostId);
            return (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-medium">Booking #{booking.id?.slice(0, 8)}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-[#422525]/50">מארח:</span>{' '}
                          <span className="font-medium">{host.email}</span>
                          {host.cancellationStrikes > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {host.cancellationStrikes} strikes
                            </Badge>
                          )}
                        </div>
                        <div>
                          <span className="text-[#422525]/50">אורח:</span>{' '}
                          <span className="font-medium">{users.find(u => u.id === booking.guestId)?.email || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-[#422525]/50">תאריכים:</span>{' '}
                          {booking.dates?.start} - {booking.dates?.end}
                        </div>
                        <div>
                          <span className="text-[#422525]/50">סה"כ:</span>{' '}
                          <span className="font-medium">₪{booking.totalPrice?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-1 text-[#422525]/60">
                          <DollarSign className="w-3 h-3" />
                          Payment: {booking.paymentIntentId ? 'Processed' : 'Pending'}
                        </div>
                        <div className="flex items-center gap-1 text-[#422525]/60">
                          <Shield className="w-3 h-3" />
                          Deposit: {booking.depositHoldId ? 'Held' : 'Not held'}
                        </div>
                      </div>
                    </div>

                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCancellingBooking(booking)}
                        disabled={cancelBookingMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        ביטול מארח
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cancellation Dialog */}
      <AlertDialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ביטול הזמנה ע"י מארח</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>פעולה זו תבצע:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>החזר מלא לאורח</li>
                <li>חסימת התאריכים ביומן</li>
                <li>הוספת Strike למארח</li>
                <li>הפחתת Ranking אם זה Strike שני</li>
                <li>הקפאת חשבון אם זה Strike שלישי</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBookingMutation.mutate(cancellingBooking)}
              className="bg-red-600 hover:bg-red-700"
            >
              אישור ביטול
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}