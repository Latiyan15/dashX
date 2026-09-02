import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { ServiceBreakdownData } from '../../types';

interface ServiceBreakdownProps {
  data?: ServiceBreakdownData | null;
}

export const ServiceBreakdown: React.FC<ServiceBreakdownProps> = ({ data }) => {
  const categories =
    data?.by_category && data.by_category.length > 0
      ? data.by_category
      : [
          { category_name: 'General Service', total_bookings: 180, total_revenue: '750000' },
          { category_name: 'AC Service', total_bookings: 135, total_revenue: '450000' },
          { category_name: 'Brake Service', total_bookings: 98, total_revenue: '290000' },
          { category_name: 'Oil Change', total_bookings: 78, total_revenue: '180000' },
          { category_name: 'Detailing', total_bookings: 68, total_revenue: '240000' },
          { category_name: 'Others', total_bookings: 93, total_revenue: '320000' },
        ];

  const maxVal = Math.max(...categories.map((c) => c.total_bookings), 200);

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Top Service Categories
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-[#1a1a22] px-2 py-0.5 rounded border border-[#262632] hover:text-white"
        >
          <span>This Month</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Category Progress Bars */}
      <div className="space-y-2.5 my-auto py-2">
        {categories.slice(0, 6).map((cat) => {
          const widthPct = Math.round((cat.total_bookings / maxVal) * 100);

          return (
            <div key={cat.category_name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium text-xs truncate flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-400 shrink-0" />
                  {cat.category_name}
                </span>
                <span className="font-mono font-bold text-slate-200 text-xs">
                  {cat.total_bookings}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#1c1c24] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-400 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(45,212,191,0.4)]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#1f1f26] flex justify-end">
        <Link
          to="/analytics"
          className="text-[11px] font-semibold text-[#FF5500] hover:text-[#ff6a1f] flex items-center gap-1 transition-colors"
        >
          View full report →
        </Link>
      </div>
    </div>
  );
};
