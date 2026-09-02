import { ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { VehicleBrandBadge } from '../common/VehicleBrandBadge';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { Booking } from '../../types';

interface BookingsTableProps {
  bookings: Booking[];
  count: number;
  currentPage: number;
  pageSize: number;
  ordering?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (field: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  count,
  currentPage,
  pageSize,
  ordering,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSelectBooking,
}) => {
  const totalPages = Math.ceil(count / pageSize) || 1;

  const renderSortIndicator = (field: string) => {
    if (ordering === field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[#FF5500] inline ml-1" />;
    }
    if (ordering === `-${field}`) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[#FF5500] inline ml-1 rotate-180" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 inline ml-1" />;
  };

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#181820] border-b border-[#23232e] text-slate-400 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3.5">Booking Ref</th>
              <th className="px-4 py-3.5">Customer Profile</th>
              <th className="px-4 py-3.5">Vehicle Specs</th>
              <th className="px-4 py-3.5">Service Package</th>
              <th className="px-4 py-3.5">Field Mechanic</th>
              <th
                className="px-4 py-3.5 cursor-pointer hover:bg-[#20202a] transition-colors"
                onClick={() => onSortChange('status')}
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                className="px-4 py-3.5 cursor-pointer hover:bg-[#20202a] transition-colors text-right"
                onClick={() => onSortChange('total_amount')}
              >
                Amount {renderSortIndicator('total_amount')}
              </th>
              <th
                className="px-4 py-3.5 cursor-pointer hover:bg-[#20202a] transition-colors"
                onClick={() => onSortChange('scheduled_at')}
              >
                Scheduled Time {renderSortIndicator('scheduled_at')}
              </th>
              <th className="px-4 py-3.5 text-center">Inspect</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1c1c24]">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-[#181820]/90 transition-colors group cursor-pointer"
                onClick={() => onSelectBooking(booking)}
              >
                {/* 1. Booking Reference */}
                <td className="px-4 py-3.5 font-mono">
                  <span className="font-extrabold text-cyan-400 group-hover:text-cyan-300">
                    {booking.reference_code}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-sans">
                    ID #{booking.id}
                  </span>
                </td>

                {/* 2. Customer Profile */}
                <td className="px-4 py-3.5">
                  <span className="font-bold text-slate-100 block">
                    {booking.customer.full_name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {booking.customer.phone}
                  </span>
                </td>

                {/* 3. Vehicle Specs */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <VehicleBrandBadge make={booking.vehicle.make} />
                    <span className="font-semibold text-slate-200">
                      {booking.vehicle.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                    <span className="bg-[#1c1c26] text-slate-300 px-1.5 py-0.2 rounded border border-[#2d2d3c]">
                      {booking.vehicle.license_plate}
                    </span>
                    <span className="text-slate-500">• {booking.vehicle.fuel_type}</span>
                  </div>
                </td>

                {/* 4. Service Package */}
                <td className="px-4 py-3.5">
                  <span className="font-bold text-slate-200 block truncate max-w-[180px]">
                    {booking.service.name}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold">
                    {booking.service.category_name}
                  </span>
                </td>

                {/* 5. Field Mechanic */}
                <td className="px-4 py-3.5">
                  {booking.mechanic ? (
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {booking.mechanic.full_name}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ★ {booking.mechanic.rating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                      Unassigned
                    </span>
                  )}
                </td>

                {/* 6. Status Badge */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={booking.status} />
                </td>

                {/* 7. Amount */}
                <td className="px-4 py-3.5 text-right font-mono font-extrabold text-slate-100">
                  {formatCurrency(booking.total_amount)}
                </td>

                {/* 8. Scheduled Time */}
                <td className="px-4 py-3.5">
                  <span className="font-mono text-[11px] text-slate-300 block">
                    {formatDateTime(booking.scheduled_at)}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                    {booking.service_location}
                  </span>
                </td>

                {/* 9. Action */}
                <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectBooking(booking)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:text-white bg-[#1a1a24] hover:bg-[#FF5500] rounded-lg border border-[#282836] transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dark Pagination Toolbar */}
      <div className="p-4 bg-[#14141a] border-t border-[#1f1f28] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-[#1c1c24] border border-[#282836] rounded-md text-slate-200 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>of <strong className="text-white font-mono">{count}</strong> total records</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-[#282836] bg-[#1a1a24] hover:bg-[#252533] disabled:opacity-40 text-slate-200 transition-colors"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#282836] font-mono text-xs text-slate-200">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-[#282836] bg-[#1a1a24] hover:bg-[#252533] disabled:opacity-40 text-slate-200 transition-colors"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
