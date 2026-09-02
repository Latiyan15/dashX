import api from './api';
import type {
  OverviewData,
  BookingsOverTimeEntry,
  RevenueOverTimeEntry,
  StatusDistributionEntry,
  ServiceBreakdownData,
} from '../types';
import {
  mockOverview,
  mockRevenueOverTime,
  mockBookingsOverTime,
  mockStatusDistribution,
  mockServiceBreakdown,
} from './mockData';

export const analyticsService = {
  getOverview: async (): Promise<OverviewData> => {
    try {
      const { data } = await api.get('/analytics/overview/');
      return data;
    } catch {
      return mockOverview;
    }
  },

  getBookingsOverTime: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<BookingsOverTimeEntry[]> => {
    try {
      const { data } = await api.get('/analytics/bookings-over-time/', { params });
      return data;
    } catch {
      return mockBookingsOverTime;
    }
  },

  getRevenueOverTime: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<RevenueOverTimeEntry[]> => {
    try {
      const { data } = await api.get('/analytics/revenue-over-time/', { params });
      return data;
    } catch {
      return mockRevenueOverTime;
    }
  },

  getStatusDistribution: async (): Promise<StatusDistributionEntry[]> => {
    try {
      const { data } = await api.get('/analytics/status-distribution/');
      return data;
    } catch {
      return mockStatusDistribution;
    }
  },

  getServiceBreakdown: async (): Promise<ServiceBreakdownData> => {
    try {
      const { data } = await api.get('/analytics/service-breakdown/');
      return data;
    } catch {
      return mockServiceBreakdown;
    }
  },
};
