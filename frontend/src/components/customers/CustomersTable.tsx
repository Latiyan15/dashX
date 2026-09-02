import React from 'react';
import { ChevronLeft, ChevronRight, Eye, User, Car } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Customer } from '../../types';

interface CustomersTableProps {
  customers: Customer[];
  count: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  count,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectCustomer,
}) => {
  const totalPages = Math.ceil(count / pageSize) || 1;

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#181820] border-b border-[#23232e] text-slate-400 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3.5">Customer Name</th>
              <th className="px-4 py-3.5">Contact Telemetry</th>
              <th className="px-4 py-3.5">Metro Location</th>
              <th className="px-4 py-3.5 text-center">Garage Fleet</th>
              <th className="px-4 py-3.5 text-center">Lifetime Bookings</th>
              <th className="px-4 py-3.5 text-right">Total LTV Spend</th>
              <th className="px-4 py-3.5">Joined Date</th>
              <th className="px-4 py-3.5 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c24]">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className="hover:bg-[#181820]/90 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1c1c24] border border-[#282836] text-slate-300 flex items-center justify-center font-bold text-xs group-hover:border-[#FF5500] group-hover:text-[#FF5500] transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{customer.full_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: #{customer.id}</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs text-slate-200 block">{customer.phone}</span>
                  <span className="text-[10px] text-slate-400 block">{customer.email}</span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-semibold text-slate-300">{customer.city}</span>
                </td>

                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                    <Car className="w-3 h-3 text-cyan-400" /> {customer.vehicle_count}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-200">
                  <span className="bg-[#1c1c26] px-2 py-0.5 rounded text-xs border border-[#2c2c3c]">
                    {customer.booking_count}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-400 text-xs">
                  {formatCurrency(customer.total_spend)}
                </td>

                <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                  {formatDate(customer.created_at)}
                </td>

                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(customer)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:text-white bg-[#1a1a24] hover:bg-[#FF5500] rounded-lg border border-[#282836] transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Toolbar */}
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
          <span>of <strong className="text-white font-mono">{count}</strong> registered owners</span>
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
