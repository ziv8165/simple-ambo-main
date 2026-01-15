import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Edit2, Activity, ShieldAlert, DollarSign, FileText, Menu, TrendingUp, Users, Home, Settings, Bell, Calendar, BarChart3, MessageSquare, Eye, RefreshCw, Search, Filter, Pencil, Mail, Phone, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SectionFeedbackModal from '@/components/admin/SectionFeedbackModal';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [revenueDateRange, setRevenueDateRange] = useState('last6Months');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [selectedReportDate, setSelectedReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [listingsStatusFilter, setListingsStatusFilter] = useState('all');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['adminMetrics', revenueDateRange, customDateRange, searchQuery],
    queryFn: async () => {
      const params = { range: revenueDateRange, searchQuery };
      if (revenueDateRange === 'custom' && customDateRange.from && customDateRange.to) {
        params.startDate = customDateRange.from;
        params.endDate = customDateRange.to;
      }
      const response = await base44.functions.invoke('getDashboardMetrics', params);
      return response.data;
    },
    refetchInterval: 5000
  });

  const { data: dailyReport } = useQuery({
    queryKey: ['dailyReport', selectedReportDate],
    queryFn: async () => {
      const reports = await base44.entities.DailyReport.filter({ 
        report_date: selectedReportDate 
      });
      return reports[0] || null;
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (date) => {
      const response = await base44.functions.invoke('generateDailyReport', { date });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dailyReport']);
      toast.success('הדוח נוצר בהצלחה');
    }
  });

  const revenueData = [
    { month: 'ינואר', value: 95000 },
    { month: 'פברואר', value: 88000 },
    { month: 'מרץ', value: 112000 },
    { month: 'אפריל', value: 108000 },
    { month: 'מאי', value: 125000 }
  ];

  const isSOS = metrics?.sosCount > 0;

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">טוען נתונים...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <div className="w-20 bg-white border-l border-gray-200 flex flex-col items-center py-6 gap-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="סקירה כללית"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          <div className="w-full h-px bg-gray-200 my-2"></div>

          <button 
            onClick={() => setActiveTab('priceVerification')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'priceVerification' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="אימות מחירים"
          >
            <DollarSign className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTab('generalApproval')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'generalApproval' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="אימות מודעות"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTab('listings')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'listings' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="ניהול מודעות"
          >
            <Home className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'users' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="ניהול משתמשים"
          >
            <Users className="w-5 h-5" />
          </button>

          <div className="w-full h-px bg-gray-200 my-2"></div>

          <button 
            onClick={() => setActiveTab('kanban')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
              activeTab === 'kanban' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="ניהול פניות"
          >
            <FileText className="w-5 h-5" />
            {isSOS && (
              <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'reports' 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="דוחות יומיים"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
        
        <button className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'לוח בקרה'}
                {activeTab === 'priceVerification' && 'אימות מחירים'}
                {activeTab === 'generalApproval' && 'אימות מודעות'}
                {activeTab === 'listings' && 'ניהול מודעות'}
                {activeTab === 'users' && 'ניהול משתמשים'}
                {activeTab === 'kanban' && 'ניהול פניות'}
                {activeTab === 'reports' && 'דוחות יומיים'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'dashboard' && 'סקירה כללית של הפעילות'}
                {activeTab === 'priceVerification' && 'בדיקת חריגות מחיר מעל 15%'}
                {activeTab === 'generalApproval' && 'אישור מודעות חדשות'}
                {activeTab === 'listings' && 'ניהול כל המודעות במערכת'}
                {activeTab === 'users' && 'ניהול כל המשתמשים במערכת'}
                {activeTab === 'kanban' && 'טיפול בפניות ואירועי חירום'}
                {activeTab === 'reports' && 'דוחות פעילות יומיים'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg"></div>
                <span className="text-sm font-medium text-gray-700">מנהל</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">הכנסות החודש</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₪{metrics?.revenueThisMonth?.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  {metrics?.revenueLastMonth > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      {(() => {
                        const change = ((metrics.revenueThisMonth - metrics.revenueLastMonth) / metrics.revenueLastMonth) * 100;
                        return change > 0 ? (
                          <span className="text-green-600 font-medium">+{change.toFixed(1)}%</span>
                        ) : change < 0 ? (
                          <span className="text-red-600 font-medium">{change.toFixed(1)}%</span>
                        ) : (
                          <span className="text-gray-600 font-medium">0%</span>
                        );
                      })()}
                      <span className="text-gray-500">מהחודש שעבר</span>
                    </div>
                  )}
                </div>

                {/* SOS Monitor */}
                <div 
                  className={`rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all ${
                    isSOS 
                      ? 'bg-red-50 border-2 border-red-500' 
                      : 'bg-white border border-gray-100'
                  }`}
                  onClick={() => setActiveTab('kanban')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">אירועי חירום</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        isSOS ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {metrics?.sosCount || 0}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSOS ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${
                        isSOS ? 'text-red-600' : 'text-green-600'
                      }`} />
                    </div>
                  </div>
                  {isSOS && (
                    <div className="text-xs text-red-600 font-medium animate-pulse">
                      ⚠️ נדרשת התערבות מיידית
                    </div>
                  )}
                </div>

                {/* Validation Queue */}
                <div 
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 transition-all"
                  onClick={() => setActiveTab('priceVerification')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">ממתינים לאימות</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics?.validationQueue || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">חוזים לבדיקה ידנית</p>
                </div>

                {/* Active Users */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">משתמשים פעילים</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics?.activeUsers?.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  {metrics?.activeUsersLastWeek !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      {(() => {
                        if (metrics.activeUsersLastWeek === 0) return <span className="text-gray-600 font-medium">חדש</span>;
                        const change = ((metrics.activeUsers - metrics.activeUsersLastWeek) / metrics.activeUsersLastWeek) * 100;
                        return change > 0 ? (
                          <span className="text-blue-600 font-medium">+{change.toFixed(1)}%</span>
                        ) : change < 0 ? (
                          <span className="text-red-600 font-medium">{change.toFixed(1)}%</span>
                        ) : (
                          <span className="text-gray-600 font-medium">0%</span>
                        );
                      })()}
                      <span className="text-gray-500">מהשבוע שעבר</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">הכנסות</h3>
                      <p className="text-sm text-gray-500 mt-1">מגמת הכנסות לפי טווח נבחר</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <select 
                        value={revenueDateRange}
                        onChange={(e) => setRevenueDateRange(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2"
                      >
                        <option value="currentMonth">חודש נוכחי</option>
                        <option value="lastMonth">חודש שעבר</option>
                        <option value="last3Months">3 חודשים אחרונים</option>
                        <option value="last6Months">חצי שנה אחרונה</option>
                        <option value="custom">בחירה אישית</option>
                      </select>
                      {revenueDateRange === 'custom' && (
                        <div className="flex gap-2 text-xs">
                          <Input
                            type="date"
                            value={customDateRange.from}
                            onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                            className="text-xs px-2 py-1"
                          />
                          <span className="text-gray-500">-</span>
                          <Input
                            type="date"
                            value={customDateRange.to}
                            onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                            className="text-xs px-2 py-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics?.monthlyRevenueData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          dot={{ fill: '#f97316', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Market Integrity */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">הוגנות מחירים</h3>
                  <p className="text-sm text-gray-500 mb-6">התפלגות רמות מחיר</p>
                  
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'הוגן', value: metrics?.integrityStats.fair, color: '#10b981' },
                            { name: 'חריגה', value: metrics?.integrityStats.warning, color: '#f59e0b' },
                            { name: 'מופקע', value: metrics?.integrityStats.high_risk, color: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {[
                            { color: '#10b981' },
                            { color: '#f59e0b' },
                            { color: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">הוגן</span>
                      </div>
                      <span className="font-medium text-gray-900">{metrics?.integrityStats.fair}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-gray-700">חריגה</span>
                      </div>
                      <span className="font-medium text-gray-900">{metrics?.integrityStats.warning}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700">מופקע</span>
                      </div>
                      <span className="font-medium text-gray-900">{metrics?.integrityStats.high_risk}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'priceVerification' && <PriceVerificationCenter />}
          {activeTab === 'generalApproval' && <GeneralApprovalCenter />}
          {activeTab === 'kanban' && <OperationsKanban />}
          {activeTab === 'reports' && (
            <DailyReportsView 
              selectedDate={selectedReportDate}
              setSelectedDate={setSelectedReportDate}
              report={dailyReport}
              onGenerate={() => generateReportMutation.mutate(selectedReportDate)}
              isGenerating={generateReportMutation.isPending}
            />
          )}
          {activeTab === 'listings' && (
            <AllListingsManager 
              listings={metrics?.allListings || []}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={listingsStatusFilter}
              setStatusFilter={setListingsStatusFilter}
            />
          )}
          {activeTab === 'users' && <UsersManagement />}
        </div>
      </div>
    </div>
  );
};

// Price Verification Center Component
const PriceVerificationCenter = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingListings, isLoading } = useQuery({
    queryKey: ['priceVerificationListings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'PENDING_REVIEW' })
  });

  const priceVerificationListings = pendingListings?.filter(listing => {
    const declared = listing.user_declared_rent || 0;
    const aiResult = listing.system_estimated_rent || listing.pricePerNight * 30 || 0;
    const diffPercent = aiResult > 0 ? Math.abs(((declared - aiResult) / aiResult) * 100) : 0;
    return diffPercent > 15;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">טוען נתונים...</div>
      </div>
    );
  }

  if (priceVerificationListings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500">אין חריגות מחיר הממתינות לאימות</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {priceVerificationListings.map(listing => {
        const declared = listing.user_declared_rent || 0;
        const aiResult = listing.system_estimated_rent || listing.pricePerNight * 30 || 0;
        const diffPercent = aiResult > 0 ? Math.round(((declared - aiResult) / aiResult) * 100) : 0;

        return (
          <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {listing.photos?.[0] ? (
                  <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Home className="w-8 h-8 text-gray-400 m-auto mt-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">{listing.title || 'ללא כותרת'}</p>
                <p className="text-xs text-gray-500">{listing.city}, {listing.neighborhood}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">מוצהר: ₪{declared.toLocaleString()}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">AI: ₪{aiResult.toLocaleString()}</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{diffPercent}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(createPageUrl('AdminEditListing') + `?id=${listing.id}`)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 rounded-lg transition-all"
            >
              בדוק ואשר
            </button>
          </div>
        );
      })}
    </div>
  );
};

// General Approval Center Component
const GeneralApprovalCenter = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingListings, isLoading } = useQuery({
    queryKey: ['generalApprovalListings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'PENDING_REVIEW' })
  });

  const generalApprovalListings = pendingListings?.filter(listing => {
    const declared = listing.user_declared_rent || 0;
    const aiResult = listing.system_estimated_rent || listing.pricePerNight * 30 || 0;
    const diffPercent = aiResult > 0 ? Math.abs(((declared - aiResult) / aiResult) * 100) : 0;
    return diffPercent <= 15;
  }) || [];

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }) => base44.entities.Listing.update(id, { 
      status: approved ? 'READY_FOR_PRICING' : 'CHANGES_REQUESTED',
      is_contract_verified: approved
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['generalApprovalListings']);
      toast.success('המודעה עודכנה בהצלחה');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">טוען נתונים...</div>
      </div>
    );
  }

  if (generalApprovalListings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500">אין מודעות הממתינות לאישור</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {generalApprovalListings.map(listing => (
        <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-all">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              {listing.photos?.[0] ? (
                <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <Home className="w-8 h-8 text-gray-400 m-auto mt-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">{listing.title || 'ללא כותרת'}</p>
              <p className="text-xs text-gray-500">{listing.city}, {listing.neighborhood}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">ממתין לאישור</span>
                {listing.pricePerNight && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">₪{listing.pricePerNight}/לילה</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => approveMutation.mutate({ id: listing.id, approved: true })}
              disabled={approveMutation.isPending}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-lg transition-all disabled:opacity-50"
            >
              ✓ אשר
            </button>
            <button
              onClick={() => navigate(createPageUrl('AdminEditListing') + `?id=${listing.id}`)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg transition-all"
            >
              ערוך
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Daily Reports View Component
const DailyReportsView = ({ selectedDate, setSelectedDate, report, onGenerate, isGenerating }) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
        <Calendar className="w-5 h-5 text-orange-600" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          max={new Date().toISOString().split('T')[0]}
        />
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isToday ? 'רענן נתונים' : 'צור דוח'}
        </button>
      </div>

      {!report ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">אין דוח ליום זה. לחץ על "צור דוח" לייצור דוח.</p>
        </div>
      ) : (
        <>
          {/* Traffic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-lg">תנועה</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">מבקרים ייחודיים</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {report.traffic?.unique_visitors?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">צפיות בדפים</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {report.traffic?.total_pageviews?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-lg">פיננסים</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">סה"כ סליקות</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₪{report.finance?.total_transactions?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">עמלות</span>
                  <span className="text-2xl font-bold text-green-700">
                    ₪{report.finance?.platform_revenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">הזמנות</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.finance?.successful_bookings || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement & Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-lg">מעורבות</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">צפיות במודעות</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.engagement?.listing_views?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">צ'אטים חדשים</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.engagement?.new_chats || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">הודעות שנשלחו</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.engagement?.messages_sent || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-lg">אופרציה</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">מודעות חדשות</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.operations?.new_listings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">משתמשים מאומתים</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.operations?.verified_users || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">דיווחים</span>
                  <span className="text-xl font-bold text-gray-900">
                    {report.operations?.reports_opened || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">אירועי SOS</span>
                  <span className={`text-xl font-bold ${
                    report.operations?.sos_incidents > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {report.operations?.sos_incidents || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// All Listings Manager Component
const AllListingsManager = ({ listings, searchQuery, setSearchQuery, statusFilter, setStatusFilter }) => {
  const navigate = useNavigate();

  // סינון לפי סטטוס
  const filteredListings = statusFilter === 'all' 
    ? listings 
    : listings.filter(l => l.status === statusFilter);

  // ספירת מודעות לפי סטטוס
  const statusCounts = {
    all: listings.length,
    ACTIVE: listings.filter(l => l.status === 'ACTIVE').length,
    PENDING_REVIEW: listings.filter(l => l.status === 'PENDING_REVIEW').length,
    ARCHIVED: listings.filter(l => l.status === 'ARCHIVED').length,
    REMOVED: listings.filter(l => l.status === 'REMOVED').length,
    CHANGES_REQUESTED: listings.filter(l => l.status === 'CHANGES_REQUESTED').length,
    READY_FOR_PRICING: listings.filter(l => l.status === 'READY_FOR_PRICING').length,
    DRAFT: listings.filter(l => l.status === 'DRAFT').length
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { text: 'פעיל', color: 'bg-green-100 text-green-800' },
      PENDING_REVIEW: { text: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800' },
      ARCHIVED: { text: 'בארכיון', color: 'bg-gray-100 text-gray-800' },
      REMOVED: { text: 'בפח אשפה', color: 'bg-red-100 text-red-800' },
      CHANGES_REQUESTED: { text: 'נדרש תיקון', color: 'bg-orange-100 text-orange-800' },
      READY_FOR_PRICING: { text: 'מוכן לתמחור', color: 'bg-blue-100 text-blue-800' },
      DRAFT: { text: 'טיוטה', color: 'bg-gray-100 text-gray-600' }
    };
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      {/* כותרת וחיפוש */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ניהול כל המודעות</h2>
          <p className="text-sm text-gray-500 mt-1">סה"כ {listings.length} מודעות במערכת</p>
        </div>
        
        {/* תיבת חיפוש */}
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש לפי מזהה, כותרת, עיר, כתובת..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* פילטר סטטוס */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          הכל ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'ACTIVE' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          פעיל ({statusCounts.ACTIVE})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING_REVIEW')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'PENDING_REVIEW' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ממתין ({statusCounts.PENDING_REVIEW})
        </button>
        <button
          onClick={() => setStatusFilter('ARCHIVED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'ARCHIVED' 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ארכיון ({statusCounts.ARCHIVED})
        </button>
        <button
          onClick={() => setStatusFilter('REMOVED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'REMOVED' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          פח אשפה ({statusCounts.REMOVED})
        </button>
      </div>

      {/* רשימת מודעות */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">מזהה</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">כותרת</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">מארח</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">מיקום</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">סטטוס</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">מחיר</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    לא נמצאו מודעות
                  </td>
                </tr>
              ) : (
                filteredListings.map(listing => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {listing.short_id || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {listing.title || 'ללא כותרת'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{listing.hostName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {listing.city || '---'}
                        {listing.neighborhood && `, ${listing.neighborhood}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {listing.pricePerNight ? `₪${listing.pricePerNight}` : '---'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(createPageUrl('ListingDetails') + `?id=${listing.id}`)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Users Management Component
const UsersManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 1000)
  });

  const { data: preferences } = useQuery({
    queryKey: ['allPreferences'],
    queryFn: () => base44.entities.UserMatchPreferences.list()
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('הועתק ללוח');
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const filteredUsers = users?.filter(user => 
    searchQuery === '' || 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חיפוש לפי שם, מייל..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="text-sm text-gray-600">
          סה"כ {filteredUsers.length} משתמשים
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">משתמש</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">פרטי קשר</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">תפקיד</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">סטטוס</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">התאמה חכמה</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const userPref = preferences?.find(p => p.userId === user.id);
              const hasSmartMatch = userPref?.hasCompletedQuiz;

              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'ללא שם'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(user.email)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={user.email}
                      >
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                      {user.phone && (
                        <button
                          onClick={() => openWhatsApp(user.phone)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={user.phone}
                        >
                          <Phone className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                      {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">פעיל</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {hasSmartMatch ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm font-medium">פעיל</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">לא פעיל</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(createPageUrl('UserProfile360') + `?id=${user.id}`)}
                    >
                      צפה בפרופיל
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Operations Kanban Component
const OperationsKanban = () => {
  const { data: tickets } = useQuery({
    queryKey: ['opsTickets'],
    queryFn: () => base44.entities.SupportTicket.list()
  });

  const urgentTickets = tickets?.filter(t => t.type === 'SOS' || t.priority === 'CRITICAL') || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Urgent Column */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            דחוף לטיפול
          </h3>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
            {urgentTickets.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {urgentTickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-red-500">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-900">
                  {ticket.type}: {ticket.title || 'פניה דחופה'}
                </span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
                  עכשיו
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{ticket.description}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 rounded-lg transition-all">
                  פתח צ׳אט
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-2 rounded-lg transition-all">
                  פרטים
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In Progress Column */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            בטיפול
          </h3>
          <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">0</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">אין פניות בטיפול</p>
        </div>
      </div>

      {/* Done Column */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            הושלם
          </h3>
          <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full">0</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">אין פניות שהושלמו</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;