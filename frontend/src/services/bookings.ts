import api from './api';
import type { Booking, BookingDetail, PaginatedResponse, BookingStatus } from '../types';
import { mockBookings } from './mockData';

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

let localBookings = [...mockBookings];

export const bookingService = {
  getBookings: async (params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> => {
    try {
      const { data } = await api.get('/bookings/', { params });
      return data;
    } catch {
      let filtered = [...localBookings];

      if (params?.status) {
        filtered = filtered.filter((b) => b.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.reference_code.toLowerCase().includes(q) ||
            b.customer.full_name.toLowerCase().includes(q) ||
            b.vehicle.license_plate.toLowerCase().includes(q) ||
            b.vehicle.make.toLowerCase().includes(q) ||
            b.vehicle.model.toLowerCase().includes(q)
        );
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        count: filtered.length,
        next: end < filtered.length ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results: filtered.slice(start, end),
      };
    }
  },

  getBookingById: async (id: number | string): Promise<BookingDetail> => {
    try {
      const { data } = await api.get(`/bookings/${id}/`);
      return data;
    } catch {
      const b = localBookings.find((item) => String(item.id) === String(id)) || localBookings[0];
      return {
        ...b,
        customer_notes: 'Please inspect the front brake pads and check for whistling engine sound during idle.',
        mechanic_notes: 'Brake pad thickness measured at 4.2mm. Recommend rotor skimming.',
        status_history: [
          {
            id: 1,
            from_status: null,
            to_status: 'PENDING',
            changed_by: 'Customer App',
            notes: 'Booking created by customer via DashX Mobile App',
            created_at: b.created_at,
          },
          {
            id: 2,
            from_status: 'PENDING',
            to_status: b.status,
            changed_by: 'Dispatcher Ops',
            notes: 'Technician dispatched to customer bay in Gurugram',
            created_at: b.scheduled_at,
          },
        ],
      };
    }
  },

  updateBookingStatus: async (
    id: number | string,
    payload: { status: string; notes?: string; changed_by?: string }
  ): Promise<BookingDetail> => {
    try {
      const { data } = await api.patch(`/bookings/${id}/status/`, payload);
      return data;
    } catch {
      localBookings = localBookings.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              status: payload.status as BookingStatus,
              status_display: payload.status.replace(/_/g, ' '),
            }
          : item
      );
      return bookingService.getBookingById(id);
    }
  },

  assignMechanic: async (
    id: number | string,
    payload: { mechanic_id: number; notes?: string; changed_by?: string }
  ): Promise<BookingDetail> => {
    try {
      const { data } = await api.patch(`/bookings/${id}/assign-mechanic/`, payload);
      return data;
    } catch {
      return bookingService.getBookingById(id);
    }
  },
};
