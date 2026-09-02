import api from './api';
import type { Customer, CustomerDetail, PaginatedResponse } from '../types';

export interface CustomerQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export const customerService = {
  getCustomers: async (params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> => {
    const { data } = await api.get('/customers/', { params });
    return data;
  },

  getCustomerById: async (id: number | string): Promise<CustomerDetail> => {
    const { data } = await api.get(`/customers/${id}/`);
    return data;
  },
};
