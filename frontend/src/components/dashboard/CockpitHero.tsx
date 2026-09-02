import React from 'react';
import {
  TrendingUp,
  CloudSun,
  Wind,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { OverviewData } from '../../types';
import engineBg from '../../assets/engine-hero-bg.png';

interface CockpitHeroProps {
  overview: OverviewData;
}

export const CockpitHero: React.FC<CockpitHeroProps> = ({ overview }) => {
  const activeMechanicsRatio = `${overview.active_mechanics} / ${overview.total_mechanics}`;
  const mechanicPercent =
    overview.total_mechanics > 0
      ? Math.round((overview.active_mechanics / overview.total_mechanics) * 100)
      : 0;

  return (
    <div
      className="cockpit-hero relative overflow-hidden rounded-2xl border border-[#23232c] shadow-2xl p-6 text-white"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(14,13,16,0.92) 0%, rgba(14,13,16,0.50) 30%, rgba(14,13,16,0.10) 65%, rgba(14,13,16,0.30) 100%), url(${engineBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
      }}
    >
      {/* Top Welcome Greeting & Environmental Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Good morning, <span className="font-extrabold text-white">Dispatcher Ops</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time overview of your fleet operations
          </p>
        </div>

        {/* Environmental telemetry */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141418]/90 backdrop-blur-md border border-[#262630] text-xs">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="font-bold text-white text-sm">28°C</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-mono">Gurugram</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141418]/90 backdrop-blur-md border border-[#262630] text-xs">
            <Wind className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="font-bold text-emerald-400 text-sm">AQI 42</span>
              <span className="text-[10px] text-emerald-400 block -mt-0.5 font-mono">Good</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Telemetry Ticker Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 pt-4 border-t border-[#23232c]/80 text-xs">
        {/* 1. Bookings */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            Bookings
          </span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">{overview.total_bookings}</span>
            <span className="text-[11px] text-emerald-400 flex items-center font-bold">
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" /> 12%
            </span>
          </div>
        </div>

        {/* 2. Revenue */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            Revenue
          </span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">
              {formatCurrency(overview.total_revenue)}
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center font-bold">
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" /> 15%
            </span>
          </div>
        </div>

        {/* 3. Jobs Done */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            Jobs Done
          </span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">
              {overview.completed_bookings}
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center font-bold">
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" /> 15%
            </span>
          </div>
        </div>

        {/* 4. Active Mechanics */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            Active Mechanics
          </span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">{activeMechanicsRatio}</span>
          </div>
          <div className="w-16 bg-slate-800 rounded-full h-1 overflow-hidden mt-1.5">
            <div
              className="bg-teal-400 h-1 rounded-full transition-all"
              style={{ width: `${mechanicPercent}%` }}
            />
          </div>
        </div>

        {/* 5. On The Way */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            On The Way
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">{overview.on_the_way_bookings}</span>
            <span className="w-2 h-2 rounded-full bg-[#FF5500] ml-1" />
          </div>
        </div>

        {/* 6. Pending */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            Pending
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">{overview.pending_bookings}</span>
            <span className="w-2 h-2 rounded-full bg-[#FF5500] ml-1" />
          </div>
        </div>

        {/* 7. Cancelled */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">
            Cancelled
          </span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xl font-extrabold text-white">
              {overview.cancelled_bookings}
            </span>
            <span className="text-[11px] text-rose-500 flex items-center font-bold">
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" /> 9%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
