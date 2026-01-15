import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ContactSupportModal from '@/components/support/ContactSupportModal';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  return (
    <>
    <footer className="bg-[#1A1A1A] text-[#FDFCF8] py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl tracking-tight">
              <span className="font-light">SIMPLE</span>
              <span className="font-bold">ambo</span>
            </span>
            <p className="mt-4 text-sm text-[#FDFCF8]/60 leading-relaxed max-w-xs">
              The trust-based sublet marketplace. Verified people, verified places.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-4 text-[#E3C766]">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-4 text-[#E3C766]">Support</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors text-left"
                >
                  Help & Support
                </button>
              </li>
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Safety
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-4 text-[#E3C766]">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Home')} className="text-sm text-[#FDFCF8]/70 hover:text-[#FDFCF8] transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#FDFCF8]/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-[#FDFCF8]/50">
            © 2025 SIMPLEambo. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-full border border-[#FDFCF8]/20 hover:border-[#FDFCF8]/50 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full border border-[#FDFCF8]/20 hover:border-[#FDFCF8]/50 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full border border-[#FDFCF8]/20 hover:border-[#FDFCF8]/50 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full border border-[#FDFCF8]/20 hover:border-[#FDFCF8]/50 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      </footer>

      {/* Contact Support Modal */}
      <ContactSupportModal
        open={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
}