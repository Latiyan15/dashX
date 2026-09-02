import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import type { BookingQueryParams } from '../../services/bookings';
import type { Mechanic, ServiceCategory } from '../../types';

interface BookingFiltersProps {
  filters: BookingQueryParams;
  onFilterChange: (newFilters: Partial<BookingQueryParams>) => void;
  onReset: () => void;
  mechanics?: Mechanic[];
  categories?: ServiceCategory[];
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  mechanics = [],
  categories = [],
}) => {
  return (
    <div className="bg-[#131317] p-4 rounded-xl border border-[#1f1f26] shadow-xl mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#FF5500]" /> Filter & Query Telemetry
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1 rounded bg-[#1c1c24] hover:bg-[#252533] border border-[#282836]"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search ref, plate (KA 01...), customer..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#181820] border border-[#282836] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-white placeholder:text-slate-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
            className="w-full px-3 py-1.5 text-xs bg-[#181820] border border-[#282836] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-slate-200 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ON_THE_WAY">On The Way</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ category: e.target.value || undefined, page: 1 })}
            className="w-full px-3 py-1.5 text-xs bg-[#181820] border border-[#282836] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-slate-200 font-medium"
          >
            <option value="">All Service Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mechanic Filter */}
        <div>
          <select
            value={filters.mechanic_id || ''}
            onChange={(e) =>
              onFilterChange({ mechanic_id: e.target.value || undefined, page: 1 })
            }
            className="w-full px-3 py-1.5 text-xs bg-[#181820] border border-[#282836] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-slate-200 font-medium"
          >
            <option value="">All Field Mechanics</option>
            {mechanics.map((mech) => (
              <option key={mech.id} value={mech.id}>
                {mech.full_name} ({mech.status_display})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
