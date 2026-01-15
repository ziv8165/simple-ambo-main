import React from 'react';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80" 
          alt="Cozy living room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/50" />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#FDFCF8] tracking-tight mb-8">
          Shall we start?
        </h2>
        <button className="px-10 py-4 border-2 border-[#FDFCF8] text-[#FDFCF8] rounded-lg text-sm tracking-widest uppercase hover:bg-[#FDFCF8] hover:text-[#1A1A1A] transition-all duration-300">
          Create Account
        </button>
      </motion.div>
    </section>
  );
}