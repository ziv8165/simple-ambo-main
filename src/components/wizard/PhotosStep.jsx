import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import FeedbackBubble from '@/components/feedback/FeedbackBubble';

export default function PhotosStep({ data, updateData, adminFeedback = {} }) {
  const [uploading, setUploading] = useState(false);
  const photos = data.photos || [];

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const result = await base44.integrations.Core.UploadFile({ file });
          return result.file_url;
        })
      );

      updateData({ photos: [...photos, ...uploadedUrls] });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    updateData({ photos: photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        יש להוסיף כמה תמונות של הנכס שלכם
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        כדאי להעלות לפחות 5 תמונות, אבל ככל שיש יותר זה טוב יותר! לאחר מכן, יש לכתוב את שם הנכס והיאור.
      </p>

      {adminFeedback.photos && (
        <div className="mb-6">
          <FeedbackBubble feedback={adminFeedback.photos} />
        </div>
      )}

      {/* 360° Tour Section */}
      <div className="mb-8 p-6 bg-[#E6DDD0]/30 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-6 h-6 text-[#BC5D34]" />
          <h3 className="text-xl font-semibold text-[#4A2525]">סיור 360° (מומלץ)</h3>
        </div>
        
        <Input
          value={data.photo360 || ''}
          onChange={(e) => updateData({ photo360: e.target.value })}
          placeholder="הדביקו קישור לסיור 360° (לדוגמה: https://momento360.com/...)"
          className="text-lg"
        />
        
        {data.photo360 && (
          <div className="mt-4 rounded-xl overflow-hidden border-2 border-[#BC5D34]/20">
            <iframe
              src={data.photo360}
              className="w-full aspect-video"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Photo Upload Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {photos.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={url}
              alt={`תמונה ${index + 1}`}
              className="w-full h-full object-cover rounded-2xl"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-[#BC5D34] text-white px-3 py-1 rounded-full text-sm font-medium">
                תמונה ראשית
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {photos.length < 10 && (
          <label className="aspect-square border-2 border-dashed border-[#E6DDD0] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#BC5D34] transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
            <Upload className="w-12 h-12 text-[#4A2525]/40 mb-2" />
            <span className="text-sm text-[#4A2525]/60">
              {uploading ? 'מעלה...' : 'הוסיפו עוד'}
            </span>
          </label>
        )}
      </div>

      <p className="text-sm text-[#4A2525]/60 text-center">
        יש לכבר לפחות 5 תמונות ({photos.length}/5)
      </p>
    </div>
  );
}