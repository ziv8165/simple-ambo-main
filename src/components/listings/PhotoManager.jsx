import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PhotoManager({ listing, onClose }) {
  const [photos, setPhotos] = useState(listing.photos || []);
  const [photo360, setPhoto360] = useState(listing.photo360 || '');
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const queryClient = useQueryClient();

  const updatePhotosMutation = useMutation({
    mutationFn: (newPhotos) => base44.entities.Listing.update(listing.id, { photos: newPhotos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('התמונות עודכנו');
    }
  });

  const update360Mutation = useMutation({
    mutationFn: (new360) => base44.entities.Listing.update(listing.id, { photo360: new360 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('קישור 360 עודכן');
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      
      const updatedPhotos = [...photos, ...newUrls];
      setPhotos(updatedPhotos);
      await updatePhotosMutation.mutateAsync(updatedPhotos);
    } catch (error) {
      toast.error('שגיאה בהעלאת התמונות');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    await updatePhotosMutation.mutateAsync(updatedPhotos);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      await updatePhotosMutation.mutateAsync(photos);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* 360 Tour URL */}
      <div>
        <label className="block mb-2 text-sm font-medium text-[#1A1A1A]">
          קישור לסיור וירטואלי 360°
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={photo360}
            onChange={(e) => setPhoto360(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-2 border border-[#E6DDD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E3C766]"
          />
          <Button
            onClick={() => update360Mutation.mutate(photo360)}
            disabled={update360Mutation.isPending}
            className="bg-[#BC5D34] hover:bg-[#A04D2A] text-white"
          >
            {update360Mutation.isPending ? 'שומר...' : 'שמור'}
          </Button>
        </div>
        {photo360 && (
          <p className="text-xs text-[#422525]/60 mt-1">
            הסיור ה-360° יוצג בצורה בולטת בגלריית התמונות
          </p>
        )}
      </div>

      <div>
        <label className="block mb-4">
          <div className="border-2 border-dashed border-[#E6DDD0] rounded-xl p-8 text-center hover:border-[#E3C766] transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-12 h-12 text-[#E3C766] animate-spin" />
                <p className="text-[#422525]/60">מעלה תמונות...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 text-[#E3C766]" />
                <p className="text-[#1A1A1A] font-medium">לחץ להעלאת תמונות</p>
                <p className="text-sm text-[#422525]/60">או גרור ושחרר כאן</p>
              </div>
            )}
          </div>
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-8 text-[#422525]/60">
          <p>אין תמונות עדיין. העלה תמונות כדי להתחיל.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#422525]/70">
            גרור ושחרר לשינוי סדר התצוגה • התמונה הראשונה תהיה תמונת השער
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="relative group cursor-move rounded-lg overflow-hidden border-2 border-transparent hover:border-[#E3C766] transition-all"
              >
                <img
                  src={photo}
                  alt={`תמונה ${index + 1}`}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <GripVertical className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-[#E3C766] text-[#1A1A1A] px-2 py-1 rounded text-xs font-medium">
                    תמונת שער
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          סגור
        </Button>
      </div>
    </div>
  );
}