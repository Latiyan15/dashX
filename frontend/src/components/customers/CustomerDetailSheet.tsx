import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Fuel,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { VehicleBrandBadge } from '../common/VehicleBrandBadge';
import type { CustomerDetail } from '../../types';

interface CustomerDetailSheetProps {
  customer: CustomerDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailSheet: React.FC<CustomerDetailSheetProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#0f0f14] shadow-2xl flex flex-col border-l border-[#242432] text-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-[#242432] flex items-center justify-between bg-[#14141a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5500] to-orange-600 text-white flex items-center justify-center font-bold shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {customer.full_name}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Registered Customer since {formatDate(customer.created_at)}
                </p>
              </div>
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
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Contact Details Card */}
            <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-[#22222e] pb-2">
                Contact & City Profile
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="font-mono text-white font-medium">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{customer.city} Metro Hub</span>
                </div>
              </div>
            </div>

            {/* Lifetime Financial Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#14141a] border border-[#22222e] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Lifetime Bookings
                </span>
                <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
                  {customer.booking_count}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14141a] border border-[#22222e] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total LTV Spend
                </span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1 block">
                  {formatCurrency(customer.total_spend)}
                </span>
              </div>
            </div>

            {/* Registered Vehicles Garage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-cyan-400" /> Registered Garage Fleet ({customer.vehicles.length})
                </h3>
              </div>

              {customer.vehicles.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#14141a] border border-[#22222e] text-center text-xs text-slate-500">
                  No vehicles registered in garage yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customer.vehicles.map((veh) => (
                    <div
                      key={veh.id}
                      className="p-3.5 rounded-xl bg-[#14141a] border border-[#22222e] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <VehicleBrandBadge make={veh.make} />
                          <span className="font-bold text-white text-xs">
                            {veh.display_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 bg-[#1c1c28] px-2 py-0.5 rounded border border-[#2a2a3c]">
                          {veh.license_plate}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#22222e] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-slate-500" /> {veh.fuel_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-slate-500" /> {veh.mileage.toLocaleString()} km
                        </span>
                        <span className="text-slate-500">{veh.year} Model</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loyalty Status Badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1b1510] to-[#14141a] border border-[#FF5500]/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FF5500]/10 text-[#FF5500]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">DashX Verified Owner</span>
                <span className="text-[10px] text-slate-400">
                  Priority slot booking & telemetry tracking enabled.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
