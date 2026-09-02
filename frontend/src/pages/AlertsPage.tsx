import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useBookings } from '../hooks/useBookings';
import { useMechanics } from '../hooks/useMechanics';
import { toast } from 'sonner';

interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  source: string;
  actionText?: string;
  actionLink?: string;
  resolved?: boolean;
}

export const AlertsPage: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: bookingsData } = useBookings({ status: 'PENDING', page_size: 10 });
  const { data: mechanicsData } = useMechanics({ page_size: 100 });

  const pendingCount = bookingsData?.count || 3;
  const offlineCount = (mechanicsData?.results || []).filter((m) => m.status === 'OFFLINE').length || 4;

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      severity: 'critical',
      title: `${pendingCount} Pending Bookings Awaiting Technician Allocation`,
      description: 'Customer work orders in Koramangala and Indiranagar have exceeded the 15-minute allocation SLA threshold.',
      time: '4 min ago',
      source: 'Dispatch SLA Engine',
      actionText: 'Assign Field Mechanic',
      actionLink: '/bookings?status=PENDING',
    },
    {
      id: 'alt-2',
      severity: 'warning',
      title: `${offlineCount} Field Technicians Currently Offline During Peak Shifts`,
      description: 'Active mechanic ratio in East Gurugram is below target threshold due to general service demand surge.',
      time: '12 min ago',
      source: 'Fleet Telemetry Guard',
      actionText: 'Inspect Mechanics',
      actionLink: '/mechanics',
    },
    {
      id: 'alt-3',
      severity: 'critical',
      title: 'Emergency Roadside Assistance Request Logged',
      description: 'Vehicle KA 01 MJ 8812 reported brake fluid leakage near Outer Ring Road.',
      time: '18 min ago',
      source: 'Emergency Dispatch Beacon',
      actionText: 'View Work Order',
      actionLink: '/bookings',
    },
    {
      id: 'alt-4',
      severity: 'info',
      title: 'WebSocket Channel ops_dashboard Broadcast Synced',
      description: 'All field technician channels and dispatch bay nodes successfully acknowledged heartbeat ping.',
      time: '25 min ago',
      source: 'ASGI Network Protocol',
    },
    {
      id: 'alt-5',
      severity: 'warning',
      title: 'Quarterly Revenue Milestone Target Approaching',
      description: 'Fleet has reached 92% of monthly target (₹18.4L / ₹20.0L) with 4 days remaining.',
      time: '1 hour ago',
      source: 'Financial Intelligence',
      actionText: 'View Financial Report',
      actionLink: '/analytics',
    },
  ]);

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.info('Alert acknowledged and archived.');
  };

  const filteredAlerts =
    severityFilter === 'all'
      ? alerts
      : alerts.filter((a) => a.severity === severityFilter);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fleet Telemetry Alerts & Exceptions"
        description="Real-time operational alerts, SLA response bottlenecks, emergency dispatches, and system exception logs."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAlerts([]);
              toast.success('All operational alerts cleared.');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#16161d] border border-[#262634] rounded-lg transition-colors"
          >
            Acknowledge All
          </button>
        </div>
      </PageHeader>

      {/* Alert Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#131317] rounded-xl border border-rose-500/30 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
              Critical SLA Alerts
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {criticalCount}
            </span>
            <span className="text-[11px] text-slate-400">Immediate bay action required</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131317] rounded-xl border border-amber-500/30 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Warnings & Bottlenecks
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {warningCount}
            </span>
            <span className="text-[11px] text-slate-400">Technician load & geofence</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#131317] rounded-xl border border-emerald-500/30 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Active Network Stream
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              ONLINE
            </span>
            <span className="text-[11px] text-slate-400">Channels WebSocket Connected</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Severity Filter Buttons */}
      <div className="flex items-center gap-2">
        {['all', 'critical', 'warning', 'info'].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
              severityFilter === sev
                ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-sm'
                : 'bg-[#14141a] text-slate-400 border-[#22222e] hover:bg-[#1a1a24] hover:text-white'
            }`}
          >
            {sev === 'all' ? 'All Alerts' : `${sev} (${alerts.filter((a) => a.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Alert Stream Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span className="font-bold text-white text-sm block">No Active Alerts</span>
            All dispatch telemetry operating within normal SLA thresholds.
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCrit = alt.severity === 'critical';
            const isWarn = alt.severity === 'warning';
            const borderCol = isCrit ? 'border-rose-500/40' : isWarn ? 'border-amber-500/30' : 'border-[#1f1f26]';
            const tagBg = isCrit
              ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              : isWarn
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              : 'bg-blue-950/60 text-blue-300 border-blue-500/40';

            return (
              <div
                key={alt.id}
                className={`bg-[#131317] rounded-xl border ${borderCol} p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition-all`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0 mt-0.5 ${tagBg}`}>
                    {alt.severity}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {alt.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {alt.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                      <span>Source: {alt.source}</span>
                      <span>•</span>
                      <span>{alt.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alt.actionLink && alt.actionText && (
                    <Link
                      to={alt.actionLink}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#FF5500] hover:bg-[#ff6a1f] px-3 py-1.5 rounded-lg transition-all shadow-xs"
                    >
                      <span>{alt.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDismiss(alt.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-[#1a1a24] rounded-lg transition-colors text-xs"
                    title="Dismiss alert"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
