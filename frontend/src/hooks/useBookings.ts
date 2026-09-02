import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, type BookingQueryParams } from '../services/bookings';
import type { PaginatedResponse, Booking, BookingDetail } from '../types';

export function useBookings(params: BookingQueryParams = {}) {
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.getBookings(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useBooking(id: number | string | null) {
  return useQuery<BookingDetail>({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id!),
    enabled: !!id,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
      changed_by,
    }: {
      id: number | string;
      status: string;
      notes?: string;
      changed_by?: string;
    }) => bookingService.updateBookingStatus(id, { status, notes, changed_by }),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['mechanics'] });
    },
  });
}

export function useAssignMechanic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      mechanic_id,
      notes,
      changed_by,
    }: {
      id: number | string;
      mechanic_id: number;
      notes?: string;
      changed_by?: string;
    }) => bookingService.assignMechanic(id, { mechanic_id, notes, changed_by }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['mechanics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
