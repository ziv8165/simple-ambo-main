import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function HeroSection() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Cozy Luxury Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[#FDFCF8]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#BC5D34]/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#E6DDD0]/60 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-[#BC5D34]/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E6DDD0]/50 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 
            className="text-6xl md:text-7xl lg:text-[8rem] font-extrabold text-[#4A2525] mb-16 leading-[0.95] tracking-tight"
            style={{ fontFamily: 'League Spartan, sans-serif' }}
          >
            Works for both<br />sides of the<br />door.
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
            <button
              onClick={() => user ? navigate(createPageUrl('MatchingQuiz')) : base44.auth.redirectToLogin(createPageUrl('MatchingQuiz'))}
              className="px-10 py-4 bg-[#E6DDD0] text-[#4A2525] rounded-full text-lg font-bold hover:bg-[#BC5D34] hover:text-[#FDFCF8] transition-all shadow-md hover:shadow-xl hover:scale-105"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              Find Your Place
            </button>
            <button
              onClick={() => user ? navigate(createPageUrl('ManageListings')) : base44.auth.redirectToLogin(createPageUrl('ManageListings'))}
              className="px-10 py-4 bg-[#E6DDD0] text-[#4A2525] rounded-full text-lg font-bold hover:bg-[#BC5D34] hover:text-[#FDFCF8] transition-all shadow-md hover:shadow-xl hover:scale-105"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              Become a Host
            </button>
          </div>

          {/* Bottom Tagline */}
          <p className="text-2xl md:text-4xl font-serif text-[#4A2525] italic mt-[-2rem]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Fair. Safe. Excitingly Simple
          </p>
        </div>
      </div>
    </section>);

}