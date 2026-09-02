import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { BookingFilters } from '../components/bookings/BookingFilters';
import { BookingsTable } from '../components/bookings/BookingsTable';
import { BookingDetailSheet } from '../components/bookings/BookingDetailSheet';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useBookings, useBooking } from '../hooks/useBookings';
import { useMechanics } from '../hooks/useMechanics';
import { useServiceCatalog } from '../hooks/useAnalytics';
import type { BookingQueryParams } from '../services/bookings';
import type { Booking } from '../types';

export const BookingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') || undefined;

  const [filters, setFilters] = useState<BookingQueryParams>({
    page: 1,
    page_size: 20,
    status: initialStatus,
    ordering: '-scheduled_at',
  });

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Queries
  const { data: bookingsData, isLoading, isError, refetch } = useBookings(filters);
  const { data: bookingDetail } = useBooking(selectedBookingId);
  const { data: mechanicsData } = useMechanics({ page_size: 100 });
  const { categories } = useServiceCatalog();

  const handleFilterChange = (newFilters: Partial<BookingQueryParams>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      if (updated.status) {
        setSearchParams({ status: updated.status });
      } else {
        setSearchParams({});
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      ordering: '-scheduled_at',
    });
    setSearchParams({});
  };

  const handleSortChange = (field: string) => {
    setFilters((prev) => {
      let newOrdering: string | undefined;
      if (prev.ordering === field) {
        newOrdering = `-${field}`;
      } else if (prev.ordering === `-${field}`) {
        newOrdering = undefined;
      } else {
        newOrdering = field;
      }
      return { ...prev, ordering: newOrdering, page: 1 };
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bookings Management"
        description="Comprehensive dispatch ledger tracking real-time vehicle work orders and technician allocations."
      >
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#16161d] border border-[#262634] rounded-lg hover:bg-[#20202a] transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FF5500]" />
          Refresh Ledger
        </button>
      </PageHeader>

      {/* Query Filters */}
      <BookingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        mechanics={mechanicsData?.results || []}
        categories={categories}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={8} />
      ) : isError ? (
        <ErrorState
          title="Could not load bookings ledger"
          message="Failed to fetch booking records from the backend API."
          onRetry={() => refetch()}
        />
      ) : !bookingsData || bookingsData.results.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="There are no vehicle bookings matching your active filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <BookingsTable
          bookings={bookingsData.results}
          count={bookingsData.count}
          currentPage={filters.page || 1}
          pageSize={filters.page_size || 20}
          ordering={filters.ordering}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onPageSizeChange={(page_size) => setFilters((prev) => ({ ...prev, page_size, page: 1 }))}
          onSortChange={handleSortChange}
          onSelectBooking={(booking: Booking) => setSelectedBookingId(booking.id)}
        />
      )}

      {/* Booking Detail Work Order Drawer */}
      <BookingDetailSheet
        booking={bookingDetail || null}
        isOpen={!!selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        availableMechanics={mechanicsData?.results || []}
      />
    </div>
  );
};
