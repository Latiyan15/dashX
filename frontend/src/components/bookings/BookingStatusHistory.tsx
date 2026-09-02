import React from 'react';
import { History, User } from 'lucide-react';
import type { BookingStatusHistoryEntry } from '../../types';
import { formatDateTime } from '../../lib/utils';
import { StatusBadge } from '../common/StatusBadge';

interface BookingStatusHistoryProps {
  history: BookingStatusHistoryEntry[];
}

export const BookingStatusHistory: React.FC<BookingStatusHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-500">No status changes recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-slate-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Immutable Audit History ({history.length})
        </h4>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#22222e]">
        {history.map((entry) => (
          <div key={entry.id} className="relative text-xs">
            {/* Timeline dot */}
            <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-[#FF5500] ring-4 ring-[#0f0f14]" />

            <div className="bg-[#14141a] p-3 rounded-xl border border-[#22222e] space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {entry.from_status ? (
                    <>
                      <StatusBadge status={entry.from_status} />
                      <span className="text-slate-500">→</span>
                    </>
                  ) : null}
                  <StatusBadge status={entry.to_status} />
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatDateTime(entry.created_at)}
                </span>
              </div>

              {entry.notes && (
                <p className="text-slate-300 text-xs italic bg-[#1a1a24] p-2 rounded-lg border border-[#262634]">
                  &ldquo;{entry.notes}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <User className="w-3 h-3 text-slate-500" />
                <span>Changed by: {entry.changed_by}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
