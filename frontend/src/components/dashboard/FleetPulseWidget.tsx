import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, User } from 'lucide-react';
import type { Mechanic } from '../../types';

interface FleetPulseWidgetProps {
  mechanics: Mechanic[];
}

const STATUS_COLOR_MAP: Record<string, { text: string; label: string }> = {
  AVAILABLE: { text: 'text-emerald-400', label: 'Available' },
  BUSY: { text: 'text-amber-400', label: 'In Bay' },
  ON_TRIP: { text: 'text-cyan-400', label: 'On Trip' },
  OFFLINE: { text: 'text-slate-400', label: 'Offline' },
};

export const FleetPulseWidget: React.FC<FleetPulseWidgetProps> = ({ mechanics }) => {
  const availableCount = mechanics.filter((m) => m.status === 'AVAILABLE').length;
  const busyCount = mechanics.filter((m) => m.status === 'BUSY').length;
  const onTripCount = mechanics.filter((m) => m.status === 'ON_TRIP').length;

  // Show first 4 mechanics that are actively working (non-offline), fallback to all
  const activeMechanics = mechanics
    .filter((m) => m.status !== 'OFFLINE')
    .slice(0, 4);
  const displayMechanics = activeMechanics.length > 0 ? activeMechanics : mechanics.slice(0, 4);

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Fleet Pulse
        </h3>
        <Link
          to="/mechanics"
          className="text-[11px] font-semibold text-[#FF5500] hover:text-[#ff6a1f] transition-colors"
        >
          View all Mechanics
        </Link>
      </div>

      {/* 3 Status Counter Boxes — live from API */}
      <div className="grid grid-cols-3 gap-2 my-auto py-2">
        <div className="p-2.5 rounded-lg bg-[#18181f] border border-[#23232e] text-center">
          <span className="text-xl font-extrabold font-mono text-emerald-400 block leading-tight">
            {availableCount}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/90">
            Available
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#18181f] border border-[#23232e] text-center">
          <span className="text-xl font-extrabold font-mono text-amber-400 block leading-tight">
            {busyCount}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400/90">
            Busy
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#18181f] border border-[#23232e] text-center">
          <span className="text-xl font-extrabold font-mono text-cyan-400 block leading-tight">
            {onTripCount}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400/90">
            On The Way
          </span>
        </div>
      </div>

      {/* Mechanic Avatars — live from API */}
      <div className="pt-2 border-t border-[#1f1f26] flex items-center justify-between gap-1">
        {displayMechanics.map((mech) => {
          const statusInfo = STATUS_COLOR_MAP[mech.status] || STATUS_COLOR_MAP.OFFLINE;
          return (
            <div key={mech.id} className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full ring-1 ring-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center">
                {mech.avatar_url ? (
                  <img
                    src={mech.avatar_url}
                    alt={mech.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-200 mt-1 truncate max-w-[55px]">
                {mech.full_name}
              </span>
              <span className={`text-[8px] font-medium ${statusInfo.text}`}>
                {mech.status_display}
              </span>
              <span className="text-[8px] font-bold text-amber-400 font-mono">
                ★ {mech.rating}
              </span>
            </div>
          );
        })}
        <Link
          to="/mechanics"
          className="p-1 text-slate-500 hover:text-white"
          aria-label="View all"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
