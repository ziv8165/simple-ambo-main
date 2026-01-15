import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, User, CheckCircle, AlertCircle, XCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
ziv
export default function UsersDirectory() {
  const navigate = useNavigate(); s
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 1000);
      return allUsers;
    }
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

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'admin' && user.role === 'admin') ||
      (roleFilter === 'user' && user.role === 'user');

    return matchesSearch && matchesRole;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-4"
        >
          <span className="text-2xl">←</span>
          <span className="text-sm font-medium">חזור</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">ניהול משתמשים</h1>
          <p className="text-gray-500 mt-1">רשימת כל המשתמשים במערכת</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="חיפוש לפי שם, מייל..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="all">כל התפקידים</option>
              <option value="user">אורח/מארח</option>
              <option value="admin">מנהל</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              סה"כ {filteredUsers.length} משתמשים
            </div>
          </div>
        </div>

        {/* Users Table */}
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
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'ללא שם'}</p>
                          <p className="text-xs text-gray-500">הצטרף {new Date(user.created_date).toLocaleDateString('he-IL')}</p>
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
    </div>
  );
}