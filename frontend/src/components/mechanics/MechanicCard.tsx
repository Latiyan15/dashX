import React, { useState } from 'react';
import {
  Wrench,
  Star,
  CheckCircle2,
  Calendar,
  Loader2,
  User,
  Navigation,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  MECHANIC_STATUS_COLORS,
  type Mechanic,
  type MechanicStatus,
} from '../../types';
import { useUpdateMechanicStatus } from '../../hooks/useMechanics';

interface MechanicCardProps {
  mechanic: Mechanic;
}

export const MechanicCard: React.FC<MechanicCardProps> = ({ mechanic }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStatusMutation = useUpdateMechanicStatus();

  const handleStatusChange = async (newStatus: MechanicStatus) => {
    if (newStatus === mechanic.status) return;
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: mechanic.id,
        status: newStatus,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColor =
    MECHANIC_STATUS_COLORS[mechanic.status] || 'bg-[#181820] text-slate-300 border-[#2a2a38]';

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-[#131317] rounded-xl border border-[#1f1f26] p-5 shadow-xl flex flex-col justify-between hover:border-[#2e2e3a] transition-all relative overflow-hidden text-slate-200"
    >
      {/* Top Accent line based on status */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          mechanic.status === 'AVAILABLE'
            ? 'bg-emerald-500'
            : mechanic.status === 'BUSY'
            ? 'bg-amber-500'
            : mechanic.status === 'ON_TRIP'
            ? 'bg-cyan-500'
            : 'bg-slate-700'
        }`}
      />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {mechanic.avatar_url ? (
                <img
                  src={mechanic.avatar_url}
                  alt={mechanic.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#282836] shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#1c1c24] border border-[#282836] flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
              )}
              {/* Status dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#131317] ${
                  mechanic.status === 'AVAILABLE'
                    ? 'bg-emerald-500'
                    : mechanic.status === 'BUSY'
                    ? 'bg-amber-500'
                    : mechanic.status === 'ON_TRIP'
                    ? 'bg-cyan-500'
                    : 'bg-slate-500'
                }`}
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {mechanic.full_name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{mechanic.phone}</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}
          >
            {mechanic.status_display}
          </span>
        </div>

        {/* Specialization Pill */}
        <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-300 bg-[#181820] p-2 rounded-lg border border-[#242430]">
          <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate font-semibold text-[11px]">{mechanic.specialization}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 text-center">
          <div className="bg-[#181820] p-2 rounded-lg border border-[#242430]">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Rating
            </span>
            <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5 mt-0.5 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {mechanic.rating}
            </span>
          </div>

          <div className="bg-[#181820] p-2 rounded-lg border border-[#242430]">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Completed
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5 font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {mechanic.total_jobs_completed}
            </span>
          </div>

          <div className="bg-[#181820] p-2 rounded-lg border border-[#242430]">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Exp.
            </span>
            <span className="text-xs font-bold text-white block mt-0.5 font-mono">
              {mechanic.experience_years} yrs
            </span>
          </div>
        </div>

        {/* Active Booking HUD Box */}
        {mechanic.active_booking ? (
          <div className="mt-3.5 p-3 rounded-xl bg-[#181824] border border-[#2a2a3c] text-xs space-y-1">
            <div className="flex items-center justify-between text-cyan-300 font-bold">
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3 text-cyan-400" /> Active Assignment
              </span>
              <span className="font-mono text-[10px] bg-[#1e1e2c] px-1.5 py-0.2 rounded border border-[#34344a]">
                {mechanic.active_booking.reference_code}
              </span>
            </div>
            <p className="text-white font-semibold text-xs">{mechanic.active_booking.customer_name}</p>
            <p className="text-slate-400 text-[11px] truncate flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400 shrink-0" />
              {mechanic.active_booking.vehicle_info} ({mechanic.active_booking.license_plate})
            </p>
          </div>
        ) : (
          <div className="mt-3.5 p-2.5 rounded-lg bg-[#181820] border border-[#242430] text-center text-xs text-slate-500">
            No active field job currently allocated.
          </div>
        )}
      </div>

      {/* Footer: Availability Toggle */}
      <div className="mt-4 pt-3 border-t border-[#1f1f26] flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400">Fleet Availability:</span>
        <div className="flex items-center gap-1.5">
          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5500]" />}
          <select
            value={mechanic.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value as MechanicStatus)}
            className="text-xs bg-[#181820] font-semibold border border-[#282838] rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-[#FF5500] focus:outline-none text-white"
          >
            <option value="AVAILABLE">Available (Free)</option>
            <option value="BUSY">Busy (In Bay)</option>
            <option value="ON_TRIP">On Trip (En Route)</option>
            <option value="OFFLINE">Offline (Off Duty)</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};
