import React from 'react';
import { IdCard, Camera, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  {
    icon: IdCard,
    title: "Verified Identity",
    description: "Everyone is verified before the first message."
  },
  {
    icon: Camera,
    title: "Video Walkthrough",
    description: "No fish-eye lens. See the real apartment."
  },
  {
    icon: Shield,
    title: "Secure Money",
    description: "Funds held in escrow until 24h after check-in."
  }
];

export default function ValueProposition() {
  return (
    <section className="py-24 bg-[#E6DDD0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-[#FDFCF8] rounded-2xl p-8 lg:p-10 text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E6DDD0] rounded-xl mb-6">
                <value.icon className="w-7 h-7 text-[#422525]" />
              </div>
              <h3 className="text-xl font-medium text-[#1A1A1A] tracking-wide mb-3">
                {value.title}
              </h3>
              <p className="text-[#422525]/70 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mt-14"
        >
          <button className="px-10 py-4 bg-[#E3C766] text-[#1A1A1A] rounded-lg text-sm tracking-wide font-medium hover:bg-[#d4b85a] transition-all">
            Start Exploring
          </button>
        </motion.div>
      </div>
    </section>
  );
}