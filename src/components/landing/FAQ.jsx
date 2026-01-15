import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "How does the deposit work?",
    answer: "Your security deposit is held securely in escrow. It's automatically refunded after 48 hours of checkout, unless the host reports any damage. This protects both parties fairly."
  },
  {
    question: "Are there fees?",
    answer: "Hosts pay 0% — we believe in empowering property owners. Guests pay a transparent service fee that covers identity verification, payment protection, and 24/7 support."
  },
  {
    question: "How does identity verification work?",
    answer: "We use bank-level identity verification powered by Stripe Identity. Users upload a government ID and take a selfie. This ensures everyone on the platform is who they say they are."
  },
  {
    question: "What if the apartment doesn't match the video?",
    answer: "If the property significantly differs from the video tour, you can request a full refund within 24 hours of check-in. Our trust team reviews each case personally."
  },
  {
    question: "Can I cancel my booking?",
    answer: "Each listing has its own cancellation policy, clearly displayed before booking. Generally, flexible listings allow free cancellation up to 48 hours before check-in."
  },
  {
    question: "Is my payment secure?",
    answer: "Absolutely. We never share your payment details with hosts. All transactions are processed through Stripe, and funds are only released 24 hours after you've checked in safely."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 bg-[#FDFCF8]">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-light text-center text-[#1A1A1A] tracking-tight mb-16">
          Popular Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-b border-[#E6DDD0] last:border-b-0"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-5 flex items-center justify-between text-left group"
              >
                <span className="text-[#1A1A1A] font-medium tracking-wide group-hover:text-[#422525] transition-colors">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#422525]/50 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-[#422525]/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}