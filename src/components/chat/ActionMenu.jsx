import React from 'react';
import { DollarSign, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ActionMenu({ conversationId, listingId, bookingId, onActionClick }) {
  const actions = [
    {
      id: 'send_money',
      label: 'Send Money / Pay',
      icon: DollarSign,
      description: 'Send payment or make a payment request',
      color: 'text-blue-600'
    },
    {
      id: 'request_refund',
      label: 'Request Refund',
      icon: RefreshCw,
      description: 'Request a refund for your reservation',
      color: 'text-green-600'
    },
    {
      id: 'report_safety',
      label: 'Report a Safety Issue',
      icon: AlertTriangle,
      description: 'Report a safety or security concern',
      color: 'text-red-600'
    },
    {
      id: 'modify_reservation',
      label: 'Modify Reservation',
      icon: Calendar,
      description: 'Change dates or details of your reservation',
      color: 'text-purple-600'
    }
  ];

  const handleActionClick = (actionId) => {
    if (onActionClick) {
      onActionClick(actionId, { conversationId, listingId, bookingId });
    } else {
      // Default behavior - show toast
      toast.info(`Action: ${actions.find(a => a.id === actionId)?.label}`);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3" dir="rtl">
          פעולות זמינות
        </h3>
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="p-3 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex items-center gap-3" dir="rtl">
                  <div className={`p-2 rounded-lg bg-gray-100 ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
