import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FeedbackBubble({ feedback, type = 'warning' }) {
  if (!feedback || (Array.isArray(feedback) && feedback.length === 0)) {
    return null;
  }

  const feedbackText = Array.isArray(feedback) ? feedback.join(' • ') : feedback;

  const iconConfig = {
    warning: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
    info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' }
  };

  const config = iconConfig[type] || iconConfig.warning;
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.borderColor} ${config.bgColor} cursor-help animate-pulse`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              המנהל ביקש תיקון
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm bg-white border border-gray-200 shadow-lg" dir="rtl">
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">משוב מהמנהל:</p>
            <p className="text-sm text-gray-700 leading-relaxed">{feedbackText}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}