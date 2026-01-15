import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoriteButton({ listingId, size = 'default' }) {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.Favorite.filter({ userId: user.id }),
    enabled: !!user
  });

  const isFavorite = favorites.some(fav => fav.listingId === listingId);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const existing = favorites.find(fav => fav.listingId === listingId);
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          userId: user.id,
          listingId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast.success(isFavorite ? 'הוסר מהמועדפים' : 'נוסף למועדפים');
    }
  });

  if (!user) return null;

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavoriteMutation.mutate();
      }}
      className={`${sizeClasses[size] || sizeClasses.default} rounded-full flex items-center justify-center transition-all ${
        isFavorite 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-white/90 hover:bg-white text-gray-600'
      }`}
      disabled={toggleFavoriteMutation.isPending}
    >
      <Heart 
        className={iconSizes[size] || iconSizes.default}
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  );
}