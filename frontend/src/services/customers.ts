import api from './api';
import type { Customer, CustomerDetail, PaginatedResponse } from '../types';
import { mockCustomers } from './mockData';

export interface CustomerQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export const customerService = {
  getCustomers: async (params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> => {
    try {
      const { data } = await api.get('/customers/', { params });
      return data;
    } catch {
      let filtered = [...mockCustomers];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.full_name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            c.address.toLowerCase().includes(q)
        );
      }
      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      };
    }
  },

  getCustomerById: async (id: number | string): Promise<CustomerDetail> => {
    try {
      const { data } = await api.get(`/customers/${id}/`);
      return data;
    } catch {
      const c = mockCustomers.find((item) => String(item.id) === String(id)) || mockCustomers[0];
      return {
        ...c,
        vehicles: [
          {
            id: 1,
            make: 'Hyundai',
            model: 'Creta 1.5 SX',
            year: 2023,
            license_plate: 'HR 26 DQ 8891',
            fuel_type: 'PETROL',
            fuel_type_display: 'Petrol',
            mileage: 18450,
            display_name: '2023 Hyundai Creta 1.5 SX',
            created_at: '2026-01-15T11:00:00Z',
          },
        ],
      };
    }
  },
};
