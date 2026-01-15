import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User, LogOut, Heart, MessageCircle, Home, CreditCard, Search, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '@/components/search/SearchBar';
import ContactSupportModal from '@/components/support/ContactSupportModal';

export default function Layout({ children }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
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

  const handleSearch = () => {
    // Dispatch custom event with search params
    const searchParams = {
      location,
      budget: budget ? parseInt(budget) : null
    };
    window.dispatchEvent(new CustomEvent('searchUpdated', { detail: searchParams }));
    
    // If not on home page, navigate there
    if (!window.location.pathname.includes('Home')) {
      navigate(createPageUrl('Home'));
    }
  };

  const handleResetFilters = () => {
    setLocation('');
    setBudget('');
    window.dispatchEvent(new CustomEvent('searchUpdated', { detail: { location: '', budget: null } }));
  };

  const hasActiveFilters = location || budget;
  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      <style>{`
        :root {
          --color-canvas: #FDFCF8;
          --color-primary: #1A1A1A;
          --color-secondary: #422525;
          --color-accent: #E6DDD0;
          --color-action: #E3C766;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        }
        
        body {
          background-color: #FDFCF8;
          color: #1A1A1A;
          letter-spacing: 0.01em;
        }
        
        .text-secondary {
          color: #422525;
        }
        
        .bg-accent {
          background-color: #E6DDD0;
        }
        
        .bg-action {
          background-color: #E3C766;
        }
        
        .btn-primary {
          background-color: #E3C766;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background-color: #d4b85a;
          transform: translateY(-1px);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        
        .float-animation-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .float-animation-delayed-2 {
          animation: float 4s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>

      {/* Global Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-2 px-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 px-4 py-1.5 bg-[#FDFCF8]/30 backdrop-blur-xl border border-[#4A2525] rounded-full shadow-lg">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-1 cursor-pointer flex-shrink-0">
              <span className="text-sm tracking-tight">
                <span className="font-light italic text-[#4A2525]">SIMPLE</span>
                <span className="font-extrabold text-[#4A2525]">ambo</span>
              </span>
            </Link>

            {/* Integrated Search */}
            <div className="hidden md:flex items-center flex-1 justify-center gap-0">
              {/* Where */}
              <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#FDFCF8]/50 cursor-pointer transition-colors rounded-l-full">
                <input
                  type="text"
                  placeholder="Where?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-[#4A2525] placeholder:text-[#4A2525]/60 w-20"
                />
              </div>

              <div className="w-px h-6 bg-[#4A2525]/20" />

              {/* When */}
              <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#FDFCF8]/50 cursor-pointer transition-colors">
                <span className="text-sm text-[#4A2525]/60">When?</span>
              </div>

              <div className="w-px h-6 bg-[#4A2525]/20" />

              {/* Budget */}
              <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#FDFCF8]/50 cursor-pointer transition-colors rounded-r-full">
                <input
                  type="number"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-[#4A2525] placeholder:text-[#4A2525]/60 w-16"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ backgroundColor: '#BC5D34' }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="ml-2 text-xs text-[#4A2525]/60 hover:text-[#BC5D34] transition-colors underline"
                >
                  Reset
                </button>
              )}
              </div>

            {/* Mobile Search Icon */}
            <button className="md:hidden w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
              <Search className="w-5 h-5 text-[#4A2525]" />
            </button>

            {/* Become a Host Button */}
            <button
              onClick={() => {
                if (user) {
                  navigate(createPageUrl('CreateListing'));
                } else {
                  base44.auth.redirectToLogin(createPageUrl('CreateListing'));
                }
              }}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-[#4A2525] hover:bg-[#4A2525]/10 rounded-full transition-all"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              Become a Host
            </button>

            {/* Right Section - Profile or Login */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-1 px-2 py-1 bg-[#E6DDD0]/40 hover:bg-[#E6DDD0]/60 rounded-full transition-all border border-[#4A2525]/20"
                  >
                    <div className="w-5 h-5 bg-[#BC5D34] rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-[#FDFCF8]" />
                    </div>
                    <span className="text-[#4A2525] font-medium text-[10px] hidden md:block">{user.full_name || user.email.split('@')[0]}</span>
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-56 bg-[#FDFCF8] rounded-xl shadow-xl border border-[#4A2525]/20 overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-[#4A2525]/10">
                          <p className="text-[10px] text-[#4A2525]/60">My Menu</p>
                        </div>

                        <Link
                          to={createPageUrl('Home')}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Home className="w-4 h-4" />
                          <span>Home</span>
                        </Link>

                        <Link
                          to={createPageUrl('Matches')}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Home className="w-4 h-4" />
                          <span>My Matches</span>
                        </Link>

                        <Link
                          to={createPageUrl('MyFavorites')}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          <span>Saved</span>
                        </Link>

                        <Link
                          to={createPageUrl('UserProfile')}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to={createPageUrl('Chat')}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Messages</span>
                        </Link>

                        <Link
                          to={createPageUrl('HostDashboard')}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Home className="w-4 h-4" />
                          <span>Host Dashboard</span>
                        </Link>





                        <div className="border-t border-[#4A2525]/10 my-1"></div>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setShowSupportModal(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-[#E6DDD0]/30 transition-colors text-[#4A2525] text-sm"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </button>

                        <button
                          onClick={() => base44.auth.logout(createPageUrl('Home'))}
                          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-red-50 transition-colors border-t border-[#4A2525]/10 text-red-600 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="px-3 py-1 bg-[#BC5D34] text-[#FDFCF8] rounded-full text-[10px] font-bold hover:bg-[#A04D2A] transition-all"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Content with Top Padding */}
      <div className="pt-20">
        {children}
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        open={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
      </div>
      );
      }