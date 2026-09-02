import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { BookingsChart } from '../components/analytics/BookingsChart';
import { RevenueChart } from '../components/analytics/RevenueChart';
import { StatusDistribution } from '../components/analytics/StatusDistribution';
import { ServiceBreakdown } from '../components/analytics/ServiceBreakdown';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import {
  useBookingsOverTime,
  useRevenueOverTime,
  useStatusDistribution,
  useServiceBreakdown,
} from '../hooks/useAnalytics';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('90d');

  const getDateParams = () => {
    if (dateRange === 'all') return undefined;
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date(now.setDate(now.getDate() - days)).toISOString().split('T')[0];
    return { start_date: startDate };
  };

  const params = getDateParams();

  const bookingsQuery = useBookingsOverTime(params);
  const revenueQuery = useRevenueOverTime(params);
  const statusQuery = useStatusDistribution();
  const breakdownQuery = useServiceBreakdown();

  const isLoading =
    bookingsQuery.isLoading ||
    revenueQuery.isLoading ||
    statusQuery.isLoading ||
    breakdownQuery.isLoading;

  const isError =
    bookingsQuery.isError ||
    revenueQuery.isError ||
    statusQuery.isError ||
    breakdownQuery.isError;

  const handleRefetchAll = () => {
    bookingsQuery.refetch();
    revenueQuery.refetch();
    statusQuery.refetch();
    breakdownQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fleet Intelligence & Telemetry"
        description="Comprehensive operational analytics, volume throughput, revenue performance, and catalog distribution."
      >
        <div className="flex items-center gap-3">
          {/* Range Selector */}
          <div className="flex items-center bg-[#131317] p-1 rounded-xl shadow-md border border-[#1f1f28] text-xs font-mono font-bold">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg transition-all uppercase ${
                  dateRange === r
                    ? 'bg-[#FF5500] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefetchAll}
            className="p-2 bg-[#16161d] border border-[#262634] rounded-xl text-slate-200 hover:bg-[#20202a] transition-colors shadow-sm"
            title="Refresh Telemetry Data"
          >
            <RefreshCw className="w-4 h-4 text-[#FF5500]" />
          </button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton count={2} />
          <CardSkeleton count={2} />
        </div>
      ) : isError ? (
        <ErrorState
          title="Telemetry Connection Error"
          message="Failed to fetch time-series telemetry or catalog breakdown from backend."
          onRetry={handleRefetchAll}
        />
      ) : (
        <>
          {/* Time Series Telemetry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bookingsQuery.data && <BookingsChart data={bookingsQuery.data} />}
            {revenueQuery.data && <RevenueChart data={revenueQuery.data} />}
          </div>

          {/* Operational Distribution & Category Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <div className="h-full">
              {statusQuery.data && <StatusDistribution data={statusQuery.data} />}
            </div>
            <div className="h-full">
              {breakdownQuery.data && <ServiceBreakdown data={breakdownQuery.data} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
