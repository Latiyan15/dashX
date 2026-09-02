import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useOverview } from '../hooks/useOverview';
import { useBookings } from '../hooks/useBookings';
import { useMechanics } from '../hooks/useMechanics';
import {
  useBookingsOverTime,
  useRevenueOverTime,
  useStatusDistribution,
  useServiceBreakdown,
} from '../hooks/useAnalytics';
import { CockpitHero } from '../components/dashboard/CockpitHero';
import { OverviewCards } from '../components/dashboard/OverviewCards';
import { BookingsChart } from '../components/analytics/BookingsChart';
import { RevenueChart } from '../components/analytics/RevenueChart';
import { StatusDistribution } from '../components/analytics/StatusDistribution';
import { ServiceBreakdown } from '../components/analytics/ServiceBreakdown';
import { FleetPulseWidget } from '../components/dashboard/FleetPulseWidget';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { LiveActivityFeed } from '../components/common/LiveActivityFeed';
import { LiveFleetMap } from '../components/dashboard/LiveFleetMap';
import { ErrorState } from '../components/common/ErrorState';
import type { LiveActivityItem, WebSocketConnectionState } from '../types';

interface DashboardOutletContext {
  connectionState: WebSocketConnectionState;
  activities: LiveActivityItem[];
  clearActivities: () => void;
}

export const DashboardPage: React.FC = () => {
  // WebSocket context from DashboardLayout outlet
  const { activities } = useOutletContext<DashboardOutletContext>();

  // API Queries — all live data
  const { data: overview, isLoading, isError, refetch } = useOverview();
  const { data: bookingsTrend } = useBookingsOverTime();
  const { data: revenueTrend } = useRevenueOverTime();
  const { data: statusDistribution } = useStatusDistribution();
  const { data: serviceBreakdown } = useServiceBreakdown();
  const { data: mechanicsData } = useMechanics({ page_size: 100 });
  const { data: recentBookingsData } = useBookings({
    page: 1,
    page_size: 10,
    ordering: '-created_at',
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-44 bg-[#131317] rounded-2xl animate-pulse border border-[#1f1f26]" />
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#131317] rounded-xl animate-pulse border border-[#1f1f26]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Telemetry Link Disrupted"
          message="Failed to synchronize with Django REST API operational telemetry endpoints."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const allMechanics = mechanicsData?.results || [];
  const recentBookings = recentBookingsData?.results || [];

  return (
    <div className="space-y-4">
      {/* 1. Cockpit Hero Greeting Strip — live overview data */}
      <CockpitHero overview={overview} />

      {/* 2. 8 KPI Metrics Cards — live overview data */}
      <OverviewCards data={overview} />

      {/* 3. Middle Analytics Grid: 4 Cards — live analytics data */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <div className="h-full">
          <BookingsChart data={bookingsTrend} />
        </div>
        <div className="h-full">
          <RevenueChart data={revenueTrend} />
        </div>
        <div className="h-full">
          <StatusDistribution data={statusDistribution} />
        </div>
        <div className="h-full">
          <ServiceBreakdown data={serviceBreakdown} />
        </div>
      </div>

      {/* 4. Bottom Operations Grid: 4 Cards — live mechanics + WebSocket activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <div className="h-full">
          <FleetPulseWidget mechanics={allMechanics} />
        </div>
        <div className="h-full">
          <RecentActivityWidget activities={activities} />
        </div>
        <div className="h-full">
          <LiveActivityFeed activities={activities} recentBookings={recentBookings} />
        </div>
        <div className="h-full">
          <LiveFleetMap bookings={recentBookings} />
        </div>
      </div>
    </div>
  );
};
