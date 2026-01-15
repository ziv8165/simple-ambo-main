import React from 'react';
import { 
  BarChart2, Home, Users, ShieldAlert, CreditCard, 
  Megaphone, Settings, FolderOpen, FileText, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminHub() {
  const navigate = useNavigate();

  const modules = [
    { 
      title: "דשבורד ונתונים", 
      desc: "תמונת מצב בזמן אמת: מונה SOS, תנועת גולשים, המרות ודוחות סגירת יום.", 
      icon: <BarChart2 size={28} />, 
      path: createPageUrl('AdminDashboard'),
      color: "bg-blue-100 text-blue-600"
    },
    { 
      title: "ניהול נכסים ומודעות", 
      desc: "אישור מודעות חדשות, עריכת מחירים, ניהול סיורי 360 ובקרת איכות.", 
      icon: <Home size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=listings',
      color: "bg-purple-100 text-purple-600"
    },
    { 
      title: "משתמשים ו-CRM", 
      desc: "ניהול מארחים ואורחים, אימות זהות, צפייה בהיסטוריה וכלי התחזות.", 
      icon: <Users size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=users',
      color: "bg-green-100 text-green-600"
    },
    { 
      title: "בטיחות ואכיפה", 
      desc: "מרכז הדיווחים, ניטור צ'אטים חשודים, הקפאת משתמשים וניהול חסימות.", 
      icon: <ShieldAlert size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=kanban',
      color: "bg-red-100 text-red-600"
    },
    { 
      title: "פיננסים ותשלומים", 
      desc: "תור תשלומים (Payouts), עצירת כספים בחירום, ביצוע החזרים ודוחות Stripe.", 
      icon: <CreditCard size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=finance',
      color: "bg-yellow-100 text-yellow-700"
    },
    { 
      title: "שיווק וצמיחה", 
      desc: "יצירת קופונים, ניהול מודעות מקודמות (Boosters) ושליחת הודעות Push.", 
      icon: <Megaphone size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=marketing',
      color: "bg-pink-100 text-pink-600"
    },
    { 
      title: "הגדרות מערכת", 
      desc: "כיול מנוע התמחור, ניהול מפת אזורים, ועריכת תבניות מייל/SMS.", 
      icon: <Settings size={28} />, 
      path: createPageUrl('AdminSettings'),
      color: "bg-slate-100 text-slate-600"
    },
    { 
      title: "ספריית מדיה וחוזים", 
      desc: "גישה מהירה לכל החוזים שהועלו, תמונות וסיורי 360 לבדיקה מרוכזת.", 
      icon: <FolderOpen size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=media',
      color: "bg-cyan-100 text-cyan-600"
    },
    { 
      title: "ניהול תוכן ו-SEO", 
      desc: "עריכת שאלות נפוצות (FAQ), דפי נחיתה לאזורים, באנרים ותקנון.", 
      icon: <FileText size={28} />, 
      path: createPageUrl('AdminDashboard') + '?tab=cms',
      color: "bg-orange-100 text-orange-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Simple Ambo Admin</h1>
        <p className="text-gray-500">מרכז השליטה הראשי - ניהול האופרציה, המשתמשים והמערכת</p>
      </div>

      {/* Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(mod.path)}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group flex flex-col justify-between h-64"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${mod.color}`}>
                  {mod.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {mod.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {mod.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-blue-600 mt-4">
              <span>עבור לניהול</span>
              <ArrowRight size={16} className="rotate-180" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}