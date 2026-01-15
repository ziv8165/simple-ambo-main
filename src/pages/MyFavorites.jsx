import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MapPin, StickyNote, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import FavoriteButton from '@/components/listings/FavoriteButton';

export default function MyFavorites() {
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.Favorite.filter({ userId: user?.id }),
    enabled: !!user
  });

  const { data: allListings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list()
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: () => base44.entities.ListingNote.filter({ userId: user?.id }),
    enabled: !!user
  });

  const saveNoteMutation = useMutation({
    mutationFn: async ({ listingId, content }) => {
      const existing = notes.find(n => n.listingId === listingId);
      if (existing) {
        await base44.entities.ListingNote.update(existing.id, { content });
      } else {
        await base44.entities.ListingNote.create({
          userId: user.id,
          listingId,
          content
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      toast.success('ההערה נשמרה');
      setNoteModalOpen(false);
      setNoteContent('');
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => base44.entities.ListingNote.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      toast.success('ההערה נמחקה');
    }
  });

  const favoriteListings = allListings.filter(listing =>
    favorites.some(fav => fav.listingId === listing.id)
  );

  const getNoteForListing = (listingId) => notes.find(n => n.listingId === listingId);

  const openNoteModal = (listing) => {
    setSelectedListing(listing);
    const existingNote = getNoteForListing(listing.id);
    setNoteContent(existingNote?.content || '');
    setNoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden" dir="rtl">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-[#BC5D34] fill-current" />
          <h1 className="text-3xl font-bold text-[#4A2525]" style={{ fontFamily: 'League Spartan, sans-serif' }}>המועדפים שלי</h1>
        </div>

        {favoriteListings.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-[#422525]/60 mb-4">עדיין לא שמרת דירות מועדפות</p>
            <Button asChild className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]">
              <Link to={createPageUrl('Home')}>חזרה לדף הבית</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteListings.map(listing => {
              const note = getNoteForListing(listing.id);
              return (
                <Card key={listing.id} className="overflow-hidden group">
                  <div className="relative h-48">
                    <Link to={createPageUrl('ListingDetails')}>
                      <img
                        src={listing.photos?.[0] || 'https://via.placeholder.com/400'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="absolute top-3 right-3">
                      <FavoriteButton listingId={listing.id} size="small" />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <Link to={createPageUrl('ListingDetails')}>
                      <h3 className="text-lg font-medium text-[#1A1A1A] mb-2 hover:text-[#E3C766] transition-colors">
                        {listing.title || `דירה ב${listing.city}`}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-sm text-[#422525]/70 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.neighborhood}, {listing.city}</span>
                    </div>
                    
                    <div className="text-lg font-semibold text-[#1A1A1A] mb-3">
                      ₪{listing.pricePerNight?.toLocaleString()} <span className="text-sm font-normal text-[#422525]/60">/ לילה</span>
                    </div>

                    {note && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 relative">
                        <div className="flex items-start gap-2">
                          <StickyNote className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#422525] line-clamp-2">{note.content}</p>
                        </div>
                        <button
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                          className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNoteModal(listing)}
                        className="flex-1"
                      >
                        <StickyNote className="w-4 h-4 ml-2" />
                        {note ? 'ערוך הערה' : 'הוסף הערה'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to={createPageUrl('Chat')}>
                          <MessageCircle className="w-4 h-4 ml-2" />
                          שלח הודעה
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הערה אישית</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="כתוב כאן הערות אישיות על הדירה..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNoteModalOpen(false)}>
                ביטול
              </Button>
              <Button
                onClick={() => saveNoteMutation.mutate({
                  listingId: selectedListing?.id,
                  content: noteContent
                })}
                disabled={!noteContent.trim() || saveNoteMutation.isPending}
                className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]"
              >
                שמור הערה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}