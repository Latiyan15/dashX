import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import { serviceCatalogService } from '../services/services';

export function useBookingsOverTime(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'bookings-over-time', params],
    queryFn: () => analyticsService.getBookingsOverTime(params),
  });
}

export function useRevenueOverTime(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['analytics', 'revenue-over-time', params],
    queryFn: () => analyticsService.getRevenueOverTime(params),
  });
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ['analytics', 'status-distribution'],
    queryFn: () => analyticsService.getStatusDistribution(),
  });
}

export function useServiceBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'service-breakdown'],
    queryFn: () => analyticsService.getServiceBreakdown(),
  });
}

export function useServiceCatalog() {
  const categoriesQuery = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => serviceCatalogService.getCategories(),
  });

  const servicesQuery = useQuery({
    queryKey: ['catalog', 'services'],
    queryFn: () => serviceCatalogService.getServices(),
  });

  return {
    categories: categoriesQuery.data || [],
    services: servicesQuery.data || [],
    isLoading: categoriesQuery.isLoading || servicesQuery.isLoading,
  };
}
