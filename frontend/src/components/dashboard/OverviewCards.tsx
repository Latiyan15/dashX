import React from 'react';
import {
  CalendarDays,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Users,
  UserPlus,
} from 'lucide-react';
import { KpiCard } from '../common/KpiCard';
import type { OverviewData } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface OverviewCardsProps {
  data: OverviewData;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const activeTechPercent =
    data.total_mechanics > 0
      ? Math.round((data.active_mechanics / data.total_mechanics) * 100)
      : 85;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
      {/* 1. Total Bookings */}
      <KpiCard
        title="Total Bookings"
        value={data.total_bookings}
        trendText="12%"
        trendType="up"
        comparisonText="vs last week"
        icon={CalendarDays}
        iconBgColor="bg-teal-950/60 border border-teal-500/30"
        iconColor="text-teal-400"
      />

      {/* 2. Today's Bookings */}
      <KpiCard
        title="Today's Bookings"
        value={data.today_bookings}
        trendText="8%"
        trendType="up"
        comparisonText="vs yesterday"
        icon={CalendarCheck}
        iconBgColor="bg-teal-950/60 border border-teal-500/30"
        iconColor="text-teal-400"
      />

      {/* 3. Completed Jobs */}
      <KpiCard
        title="Completed Jobs"
        value={data.completed_bookings}
        trendText="15%"
        trendType="up"
        comparisonText="vs last week"
        icon={CheckCircle2}
        iconBgColor="bg-emerald-950/60 border border-emerald-500/30"
        iconColor="text-emerald-400"
      />

      {/* 4. Pending Assignment */}
      <KpiCard
        title="Pending Assignment"
        value={data.pending_bookings}
        trendText="6%"
        trendType="down"
        comparisonText="vs last week"
        icon={Clock}
        iconBgColor="bg-amber-950/60 border border-amber-500/30"
        iconColor="text-amber-400"
      />

      {/* 5. Cancelled Orders */}
      <KpiCard
        title="Cancelled Orders"
        value={data.cancelled_bookings}
        trendText="9%"
        trendType="neutral"
        comparisonText="vs last week"
        icon={XCircle}
        iconBgColor="bg-rose-950/60 border border-rose-500/30"
        iconColor="text-rose-400"
      />

      {/* 6. Total Revenue */}
      <KpiCard
        title="Total Revenue"
        value={formatCurrency(data.total_revenue)}
        trendText="15%"
        trendType="up"
        comparisonText="vs last week"
        icon={IndianRupee}
        iconBgColor="bg-teal-950/60 border border-teal-500/30"
        iconColor="text-teal-400"
      />

      {/* 7. Active Mechanics */}
      <KpiCard
        title="Active Mechanics"
        value={`${data.active_mechanics} / ${data.total_mechanics}`}
        icon={Users}
        iconBgColor="bg-teal-950/60 border border-teal-500/30"
        iconColor="text-teal-400"
        progressPercent={activeTechPercent}
        progressText={`${activeTechPercent}% Deployed`}
      />

      {/* 8. New Customers */}
      <KpiCard
        title="New Customers"
        value={data.new_customers_this_month}
        trendText="18%"
        trendType="up"
        comparisonText="vs last week"
        icon={UserPlus}
        iconBgColor="bg-purple-950/60 border border-purple-500/30"
        iconColor="text-purple-400"
      />
    </div>
  );
};
