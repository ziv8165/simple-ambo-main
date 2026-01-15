import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "שרה מ.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    quote: "סוף סוף פלטפורמה שבה הרגשתי בטוחה להשכיר את הדירה שלי. תהליך האימות נתן לי שקט נפשי מלא.",
    rating: 5,
    role: "מארחת"
  },
  {
    id: 2,
    name: "דוד כ.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    quote: "הסיור הווידאו חסך לי המון זמן. מה שרואים זה מה שמקבלים.",
    rating: 5,
    role: "שוכר"
  },
  {
    id: 3,
    name: "מיה ל.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    quote: "התשלום דרך נאמנות נתן לי ביטחון להזמין. החוויה הכי טובה שהיתה לי בהשכרת משנה.",
    rating: 5,
    role: "שוכרת"
  },
  {
    id: 4,
    name: "תום ר.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    quote: "כמארח, אני אוהב שאני לא משלם עמלות. הפלטפורמה באמת שמה אותנו במקום הראשון.",
    rating: 5,
    role: "מארח"
  },
  {
    id: 5,
    name: "אלנה ו.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    quote: "עברתי לתל אביב ל-3 חודשים ומצאתי את המקום המושלם תוך שעות. חלק ומהיר.",
    rating: 5,
    role: "שוכרת"
  }
];

export default function Testimonials() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-24 bg-[#FDFCF8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-[#1A1A1A] tracking-tight">
            מה אומרים עלינו
          </h2>
          
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-[#E6DDD0] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FDFCF8] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-[#E6DDD0] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FDFCF8] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 w-80 snap-start"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6DDD0]/50 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{testimonial.name}</p>
                    <p className="text-xs text-[#422525]/60">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E3C766] text-[#E3C766]" />
                  ))}
                </div>
                
                <p className="text-[#422525]/80 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}