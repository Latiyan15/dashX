import api from './api';
import type { Booking, BookingDetail, PaginatedResponse } from '../types';

export interface BookingQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  mechanic_id?: number | string;
  service_id?: number | string;
  category?: string;
  start_date?: string;
  end_date?: string;
  ordering?: string;
}

export const bookingService = {
  getBookings: async (params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> => {
    const { data } = await api.get('/bookings/', { params });
    return data;
  },

  getBookingById: async (id: number | string): Promise<BookingDetail> => {
    const { data } = await api.get(`/bookings/${id}/`);
    return data;
  },

  updateBookingStatus: async (
    id: number | string,
    payload: { status: string; notes?: string; changed_by?: string }
  ): Promise<BookingDetail> => {
    const { data } = await api.patch(`/bookings/${id}/status/`, payload);
    return data;
  },

  assignMechanic: async (
    id: number | string,
    payload: { mechanic_id: number; notes?: string; changed_by?: string }
  ): Promise<BookingDetail> => {
    const { data } = await api.patch(`/bookings/${id}/assign-mechanic/`, payload);
    return data;
  },
};
