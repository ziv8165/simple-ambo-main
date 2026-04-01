import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmationUploader({ booking, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const queryClient = useQueryClient();

  const images = booking.confirmationImages || [];

  const updateImagesMutation = useMutation({
    mutationFn: (newImages) =>
      base44.entities.Booking.update(booking.id, { confirmationImages: newImages }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('תמונות האישור עודכנו');
    },
    onError: () => {
      toast.error('שגיאה בעדכון התמונות');
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);

      const updatedImages = [...images, ...newUrls];
      await updateImagesMutation.mutateAsync(updatedImages);
    } catch (error) {
      toast.error('שגיאה בהעלאת התמונות');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    await updateImagesMutation.mutateAsync(updatedImages);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#4A2525]">
          תמונות אישור - הזמנה #{booking.id?.slice(0, 8)}
        </h3>
        <span className="text-sm text-[#4A2525]/60">
          {images.length} תמונות
        </span>
      </div>

      {/* Upload Area */}
      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-[#E6DDD0] rounded-xl p-6 text-center hover:border-[#BC5D34] transition-colors">
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 text-[#BC5D34] animate-spin" />
              <p className="text-sm text-[#4A2525]/60">מעלה תמונות...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-[#BC5D34]" />
              <p className="text-sm font-medium text-[#4A2525]">לחץ להעלאת תמונות אישור</p>
              <p className="text-xs text-[#4A2525]/50">תמונות או PDF</p>
            </div>
          )}
        </div>
      </label>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-[#E6DDD0] aspect-video"
            >
              {url.endsWith('.pdf') ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">PDF</p>
                  </div>
                </div>
              ) : (
                <img
                  src={url}
                  alt={`אישור ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewImage(url)}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                >
                  <ZoomIn className="w-4 h-4 text-[#4A2525]" />
                </button>
                <button
                  onClick={() => removeImage(index)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-[#4A2525]/50 text-sm">
          אין תמונות אישור עדיין
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-[#E6DDD0]">
        <Button variant="outline" onClick={onClose}>
          סגור
        </Button>
      </div>

      {/* Image Preview Overlay */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {previewImage.endsWith('.pdf') ? (
              <iframe src={previewImage} className="w-full h-[70vh] rounded-lg bg-white" title="PDF Preview" />
            ) : (
              <img src={previewImage} alt="אישור" className="w-full rounded-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
