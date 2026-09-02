import React, { useState } from 'react';
import { Search, RefreshCw, Wrench, Zap, Navigation, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MechanicCard } from '../components/mechanics/MechanicCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useMechanics } from '../hooks/useMechanics';
import type { MechanicQueryParams } from '../services/mechanics';

export const MechanicsPage: React.FC = () => {
  const [filters, setFilters] = useState<MechanicQueryParams>({
    page_size: 50,
  });

  const { data: mechanicsData, isLoading, isError, refetch } = useMechanics(filters);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
  };

  const allMechanics = mechanicsData?.results || [];
  const availableCount = allMechanics.filter((m) => m.status === 'AVAILABLE').length;
  const busyCount = allMechanics.filter((m) => m.status === 'BUSY').length;
  const onTripCount = allMechanics.filter((m) => m.status === 'ON_TRIP').length;
  const offlineCount = allMechanics.filter((m) => m.status === 'OFFLINE').length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Field Mechanics & Dispatch"
        description="Monitor field technician availability, active assignments, ratings, and workload distribution across Gurugram."
      >
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#16161d] border border-[#262634] rounded-lg hover:bg-[#20202a] transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FF5500]" />
          Refresh Fleet
        </button>
      </PageHeader>

      {/* Fleet Pulse Telemetry Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => handleStatusFilter('AVAILABLE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filters.status === 'AVAILABLE'
              ? 'bg-emerald-950/60 border-emerald-500/60 shadow-lg'
              : 'bg-[#131317] border-[#1f1f26] hover:border-[#2a2a36]'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>Available</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{availableCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Ready for immediate dispatch</p>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilter('BUSY')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filters.status === 'BUSY'
              ? 'bg-amber-950/60 border-amber-500/60 shadow-lg'
              : 'bg-[#131317] border-[#1f1f26] hover:border-[#2a2a36]'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Busy in Bay</span>
            <Wrench className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{busyCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active vehicle repair work</p>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilter('ON_TRIP')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filters.status === 'ON_TRIP'
              ? 'bg-cyan-950/60 border-cyan-500/60 shadow-lg'
              : 'bg-[#131317] border-[#1f1f26] hover:border-[#2a2a36]'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <span>On Trip</span>
            <Navigation className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{onTripCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">En route to customer location</p>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilter('OFFLINE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filters.status === 'OFFLINE'
              ? 'bg-slate-900 border-slate-600 shadow-lg'
              : 'bg-[#131317] border-[#1f1f26] hover:border-[#2a2a36]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Offline</span>
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{offlineCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Off-duty / Shift rest</p>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#131317] p-4 rounded-xl border border-[#1f1f26] shadow-xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search mechanics by name, specialization, phone..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#181820] border border-[#282836] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-white placeholder:text-slate-500"
          />
        </div>
        {filters.status && (
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, status: undefined }))}
            className="text-xs text-[#FF5500] hover:underline font-semibold"
          >
            Clear status filter ({filters.status})
          </button>
        )}
      </div>

      {/* Grid of Mechanic Cards */}
      {isLoading ? (
        <CardSkeleton count={8} />
      ) : isError ? (
        <ErrorState
          title="Could not load fleet mechanics"
          message="Failed to fetch mechanic roster from backend API."
          onRetry={() => refetch()}
        />
      ) : allMechanics.length === 0 ? (
        <EmptyState
          title="No mechanics found"
          description="Try clearing your search query or status filter to see available technicians."
          actionText="Clear Filters"
          onAction={() => setFilters({ page_size: 50 })}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allMechanics.map((mech) => (
            <MechanicCard key={mech.id} mechanic={mech} />
          ))}
        </div>
      )}
    </div>
  );
};
