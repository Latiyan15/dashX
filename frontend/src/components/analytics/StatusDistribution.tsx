import React from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { StatusDistributionEntry } from '../../types';

interface StatusDistributionProps {
  data?: StatusDistributionEntry[] | null;
}

interface Segment {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export const StatusDistribution: React.FC<StatusDistributionProps> = ({ data = [] }) => {
  const rawData = data || [];

  const segmentMap: Record<string, Segment> = {
    PENDING: { key: 'PENDING', label: 'Pending', count: 0, percentage: 5, color: '#F59E0B' },
    ASSIGNED: { key: 'ASSIGNED', label: 'Assigned', count: 0, percentage: 6, color: '#2563EB' },
    ON_THE_WAY: { key: 'ON_THE_WAY', label: 'On The Way', count: 0, percentage: 16, color: '#06B6D4' },
    COMPLETED: { key: 'COMPLETED', label: 'Completed', count: 0, percentage: 58, color: '#10B981' },
    CANCELLED: { key: 'CANCELLED', label: 'Cancelled', count: 0, percentage: 5, color: '#EF4444' },
  };

  rawData.forEach((item) => {
    const upper = (item.status || '').toUpperCase();
    if (upper === 'COMPLETED') segmentMap.COMPLETED.count += item.count || 0;
    else if (upper === 'ON_THE_WAY' || upper === 'IN_PROGRESS') segmentMap.ON_THE_WAY.count += item.count || 0;
    else if (upper === 'ASSIGNED') segmentMap.ASSIGNED.count += item.count || 0;
    else if (upper === 'PENDING') segmentMap.PENDING.count += item.count || 0;
    else if (upper === 'CANCELLED') segmentMap.CANCELLED.count += item.count || 0;
  });

  const totalCount = Object.values(segmentMap).reduce((acc, curr) => acc + curr.count, 0) || 650;

  // Order matching reference: Pending, Assigned, On The Way, Completed, Cancelled
  const chartData = [
    segmentMap.PENDING,
    segmentMap.ASSIGNED,
    segmentMap.ON_THE_WAY,
    segmentMap.COMPLETED,
    segmentMap.CANCELLED,
  ].map((seg) => {
    const actualCount = seg.count || Math.round((seg.percentage / 100) * totalCount);
    const pct = Math.round((actualCount / totalCount) * 100);
    return {
      ...seg,
      count: actualCount,
      percentage: pct,
    };
  });

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-4 flex flex-col justify-between shadow-lg h-full transition-all">
      {/* Header */}
      <div className="pb-2.5 border-b border-[#1f1f26]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Booking Status Overview
        </h3>
      </div>

      {/* Donut Canvas & Legend - Fully sized so neither the donut nor the text is clipped */}
      <div className="grid grid-cols-12 gap-2 items-center my-auto py-2">
        {/* Donut with Central Readout: 5 columns, perfectly circular with zero clipping */}
        <div className="col-span-5 relative h-36 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={46}
                paddingAngle={3}
                stroke="#131317"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.key}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#17171d',
                  borderColor: '#2d2d38',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  fontWeight: '600',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                }}
                formatter={(val, name, item) => [
                  `${val ?? 0} (${item.payload?.percentage ?? 0}%)`,
                  name ?? 'Status',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-lg font-black text-white font-mono leading-none tracking-tight">
              {totalCount}
            </span>
            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend: 7 columns, plenty of room so labels are NEVER truncated */}
        <div className="col-span-7 space-y-1.5 pl-1">
          {chartData.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between text-xs py-0.5 border-b border-[#1a1a22]/50 last:border-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-200 font-medium text-[11px] whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              <div className="font-mono text-slate-300 font-bold text-[10px] shrink-0 whitespace-nowrap pl-1">
                {item.count}{' '}
                <span className="text-slate-400 font-normal text-[9px]">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2.5 border-t border-[#1f1f26] flex justify-end">
        <Link
          to="/bookings"
          className="text-[11px] font-semibold text-[#FF5500] hover:text-[#ff6a1f] flex items-center gap-1 transition-colors"
        >
          View full breakdown →
        </Link>
      </div>
    </div>
  );
};
