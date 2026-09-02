import React from 'react';
import { Link } from 'react-router-dom';
import { Package, User, Calendar } from 'lucide-react';
import type { LiveActivityItem } from '../../types';

interface RecentActivityWidgetProps {
  activities: LiveActivityItem[];
}

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

function getActivityIcon(type: string) {
  if (type === 'BOOKING_UPDATED') return { icon: Package, bg: 'bg-teal-950/60 border border-teal-500/30 text-teal-400' };
  if (type === 'MECHANIC_STATUS_CHANGED') return { icon: User, bg: 'bg-amber-950/60 border border-amber-500/30 text-amber-400' };
  return { icon: Calendar, bg: 'bg-blue-950/60 border border-blue-500/30 text-blue-400' };
}

const FALLBACK_ITEMS = [
  { id: 'f1', type: 'BOOKING_UPDATED' as const, message: 'Waiting for live events from WebSocket...', timestamp: new Date().toISOString() },
];

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities }) => {
  const displayItems = activities.length > 0 ? activities.slice(0, 4) : FALLBACK_ITEMS;

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Recent Activity
        </h3>
        <Link
          to="/bookings"
          className="text-[11px] font-semibold text-[#FF5500] hover:text-[#ff6a1f] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Activity List — live from WebSocket */}
      <div className="space-y-2.5 my-auto py-2">
        {displayItems.map((item) => {
          const { icon: Icon, bg } = getActivityIcon(item.type);
          return (
            <div key={item.id} className="flex items-start gap-2.5">
              <div className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-200 leading-snug truncate">
                  {item.message}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  {getRelativeTime(item.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
