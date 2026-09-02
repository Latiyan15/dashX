import api from './api';
import type {
  OverviewData,
  BookingsOverTimeEntry,
  RevenueOverTimeEntry,
  StatusDistributionEntry,
  ServiceBreakdownData,
} from '../types';

export const analyticsService = {
  getOverview: async (): Promise<OverviewData> => {
    const { data } = await api.get('/analytics/overview/');
    return data;
  },

  getBookingsOverTime: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<BookingsOverTimeEntry[]> => {
    const { data } = await api.get('/analytics/bookings-over-time/', { params });
    return data;
  },

  getRevenueOverTime: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<RevenueOverTimeEntry[]> => {
    const { data } = await api.get('/analytics/revenue-over-time/', { params });
    return data;
  },

  getStatusDistribution: async (): Promise<StatusDistributionEntry[]> => {
    const { data } = await api.get('/analytics/status-distribution/');
    return data;
  },

  getServiceBreakdown: async (): Promise<ServiceBreakdownData> => {
    const { data } = await api.get('/analytics/service-breakdown/');
    return data;
  },
};
