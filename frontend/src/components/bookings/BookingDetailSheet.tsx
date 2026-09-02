import React from 'react';
import {
  X,
  User,
  Car,
  Wrench,
  MapPin,
  FileText,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Fuel,
  Gauge,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { VehicleBrandBadge } from '../common/VehicleBrandBadge';
import { BookingStatusActions } from './BookingStatusActions';
import { BookingStatusHistory } from './BookingStatusHistory';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { BookingDetail, Mechanic } from '../../types';

interface BookingDetailSheetProps {
  booking: BookingDetail | null;
  isOpen: boolean;
  onClose: () => void;
  availableMechanics?: Mechanic[];
}

export const BookingDetailSheet: React.FC<BookingDetailSheetProps> = ({
  booking,
  isOpen,
  onClose,
  availableMechanics = [],
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-[#0f0f14] shadow-2xl flex flex-col border-l border-[#242432] text-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-[#242432] flex items-center justify-between bg-[#14141a]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-lg font-bold tracking-tight text-cyan-300">
                  {booking.reference_code}
                </span>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-[11px] text-slate-400">
                Created on {formatDateTime(booking.created_at)} • Instant Mechanic Dispatch
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252533] transition-colors"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Status Transition Actions */}
            <BookingStatusActions
              booking={booking}
              availableMechanics={availableMechanics}
              onSuccess={() => {}}
            />

            {/* Vehicle & Customer Telemetry Profile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Specs */}
              <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-cyan-400" /> Vehicle Profile
                  </span>
                  <VehicleBrandBadge make={booking.vehicle.make} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {booking.vehicle.display_name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-[#1e1e28] px-2 py-0.5 rounded border border-[#2e2e3e]">
                      {booking.vehicle.license_plate}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#22222e] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-slate-400" /> {booking.vehicle.fuel_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400" /> {booking.vehicle.mileage.toLocaleString()} km
                  </span>
                </div>
              </div>

              {/* Customer Profile */}
              <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" /> Customer
                  </span>
                  <span className="text-[10px] font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                    {booking.customer.city}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {booking.customer.full_name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {booking.customer.phone}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#22222e] text-[11px] text-slate-400 truncate">
                  {booking.customer.email}
                </div>
              </div>
            </div>

            {/* Service & Assigned Mechanic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Details */}
              <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-400" /> Service Package
                  </span>
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {booking.service.estimated_duration_minutes} mins
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {booking.service.name}
                </p>
                <p className="text-xs text-slate-400">
                  Category: {booking.service.category_name}
                </p>
              </div>

              {/* Assigned Mechanic */}
              <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Field Specialist
                  </span>
                  {booking.mechanic && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ★ {booking.mechanic.rating}
                    </span>
                  )}
                </div>
                {booking.mechanic ? (
                  <div>
                    <p className="text-sm font-bold text-white">
                      {booking.mechanic.full_name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {booking.mechanic.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-amber-400 font-semibold py-1">
                    Pending technician allocation
                  </p>
                )}
              </div>
            </div>

            {/* Schedule & Location Box */}
            <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-cyan-400 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-300">Appointment Schedule</span>
                  <p className="font-mono text-xs text-white mt-0.5">
                    {formatDateTime(booking.scheduled_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#22222e]">
                <MapPin className="w-4 h-4 text-rose-400 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-300">Service Location</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {booking.service_location}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Ledger Calculation */}
            <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#22222e] pb-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span>Financial Ledger & Work Order Bill</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Package Fee</span>
                  <span className="font-mono text-slate-200">{formatCurrency(booking.base_price)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Additional Consumables & Taxes</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(booking.additional_charges)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#22222e] flex justify-between font-bold text-sm text-white">
                  <span>Total Amount (INR)</span>
                  <span className="font-mono text-emerald-400">
                    {formatCurrency(booking.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Mechanic Remarks */}
            {(booking.customer_notes || booking.mechanic_notes) && (
              <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" /> Dispatch Remarks
                </span>
                {booking.customer_notes && (
                  <p className="text-xs text-slate-300 bg-[#1a1a24] p-2.5 rounded-lg border border-[#282838]">
                    <strong className="text-slate-400 block mb-0.5">Customer Notes:</strong>
                    {booking.customer_notes}
                  </p>
                )}
                {booking.mechanic_notes && (
                  <p className="text-xs text-slate-300 bg-[#1a1a24] p-2.5 rounded-lg border border-[#282838]">
                    <strong className="text-slate-400 block mb-0.5">Technician Remarks:</strong>
                    {booking.mechanic_notes}
                  </p>
                )}
              </div>
            )}

            {/* Audit History Timeline */}
            <BookingStatusHistory history={booking.status_history} />
          </div>
        </div>
      </div>
    </div>
  );
};
