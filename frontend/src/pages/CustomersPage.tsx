import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { CustomersTable } from '../components/customers/CustomersTable';
import { CustomerDetailSheet } from '../components/customers/CustomerDetailSheet';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useCustomers, useCustomer } from '../hooks/useCustomers';
import type { CustomerQueryParams } from '../services/customers';
import type { Customer } from '../types';

export const CustomersPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerQueryParams>({
    page: 1,
    page_size: 20,
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: customersData, isLoading, isError, refetch } = useCustomers(filters);
  const { data: customerDetail } = useCustomer(selectedCustomerId);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehicle Owner & Customer Directory"
        description="Comprehensive customer profile registry with registered vehicles, garage fleets, and lifetime metrics."
      >
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#16161d] border border-[#262634] rounded-lg hover:bg-[#20202a] transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FF5500]" />
          Refresh Directory
        </button>
      </PageHeader>

      {/* Search Toolbar */}
      <div className="bg-[#131317] p-4 rounded-xl border border-[#1f1f26] shadow-xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer name, phone (+91...), email, city..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#181820] border border-[#282836] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-white placeholder:text-slate-500 font-medium"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : isError ? (
        <ErrorState
          title="Could not load customer directory"
          message="Failed to fetch customer profile records from backend API."
          onRetry={() => refetch()}
        />
      ) : !customersData || customersData.results.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try modifying your search criteria to locate customer garage profiles."
          actionText="Reset Search"
          onAction={() => setFilters({ page: 1, page_size: 20 })}
        />
      ) : (
        <CustomersTable
          customers={customersData.results}
          count={customersData.count}
          currentPage={filters.page || 1}
          pageSize={filters.page_size || 20}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onPageSizeChange={(page_size) => setFilters((prev) => ({ ...prev, page_size, page: 1 }))}
          onSelectCustomer={(customer: Customer) => setSelectedCustomerId(customer.id)}
        />
      )}

      {/* Customer Detail Drawer */}
      <CustomerDetailSheet
        customer={customerDetail || null}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
};
