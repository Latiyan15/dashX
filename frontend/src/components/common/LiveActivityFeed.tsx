import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LiveActivityItem, Booking } from '../../types';

interface LiveActivityFeedProps {
  activities?: LiveActivityItem[];
  recentBookings?: Booking[];
  onClear?: () => void;
}

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-500/30', label: 'Pending' },
  ASSIGNED: { color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-500/30', label: 'Assigned' },
  ON_THE_WAY: { color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-500/30', label: 'On The Way' },
  IN_PROGRESS: { color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-500/30', label: 'In Progress' },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-500/30', label: 'Completed' },
  CANCELLED: { color: 'text-rose-400', bg: 'bg-rose-950/50 border-rose-500/30', label: 'Cancelled' },
};

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

interface FeedEntry {
  id: string;
  ref: string;
  name?: string;
  status: string;
  statusKey: string;
  time: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  activities = [],
  recentBookings = [],
}) => {
  // Build feed from WebSocket activities first, then fill with recent bookings
  const wsEntries: FeedEntry[] = activities
    .filter((a) => a.type === 'BOOKING_UPDATED')
    .slice(0, 5)
    .map((a) => {
      // Extract reference code from message like "Booking IM-260901-00227 moved to On The Way"
      const refMatch = a.message.match(/Booking (IM-\S+)/);
      return {
        id: a.id,
        ref: refMatch?.[1] || 'Unknown',
        name: undefined,
        status: a.statusKey ? (STATUS_STYLE[a.statusKey]?.label || a.statusKey) : 'Updated',
        statusKey: a.statusKey || 'PENDING',
        time: getRelativeTime(a.timestamp),
      };
    });

  // Fill remaining slots with recent bookings from the API
  const remainingSlots = 5 - wsEntries.length;
  const bookingEntries: FeedEntry[] = recentBookings
    .slice(0, Math.max(0, remainingSlots))
    .map((b) => ({
      id: `booking-${b.id}`,
      ref: b.reference_code,
      name: b.customer.full_name,
      status: STATUS_STYLE[b.status]?.label || b.status_display,
      statusKey: b.status,
      time: getRelativeTime(b.created_at),
    }));

  const feedItems = [...wsEntries, ...bookingEntries].slice(0, 5);

  // If still empty, show a placeholder
  const hasItems = feedItems.length > 0;

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Operations Feed
          </h3>
        </div>
        <Link
          to="/bookings"
          className="text-[11px] font-semibold text-[#FF5500] hover:text-[#ff6a1f] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Feed Items */}
      <div className="space-y-2 my-auto py-1.5">
        {!hasItems && (
          <div className="text-center py-4 text-xs text-slate-500">
            Waiting for live operations data...
          </div>
        )}
        {feedItems.map((item) => {
          const style = STATUS_STYLE[item.statusKey] || STATUS_STYLE.PENDING;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs py-1 border-b border-[#1a1a22] last:border-0"
            >
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-mono font-bold text-slate-200 block text-[11px]">
                  {item.ref}
                </span>
                {item.name && (
                  <span className="text-[10px] text-slate-400 truncate block">
                    {item.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border ${style.bg} ${style.color}`}
                >
                  {item.status}
                </span>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                  {item.time}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
