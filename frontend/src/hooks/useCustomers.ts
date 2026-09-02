import { useQuery } from '@tanstack/react-query';
import { customerService, type CustomerQueryParams } from '../services/customers';
import type { PaginatedResponse, Customer, CustomerDetail } from '../types';

export function useCustomers(params: CustomerQueryParams = {}) {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomer(id: number | string | null) {
  return useQuery<CustomerDetail>({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomerById(id!),
    enabled: !!id,
  });
}
