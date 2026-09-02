// Analytics types matching Django backend
export interface OverviewData {
  total_bookings: number;
  today_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  assigned_bookings: number;
  on_the_way_bookings: number;
  in_progress_bookings: number;
  cancelled_bookings: number;
  total_revenue: string;
  today_revenue: string;
  active_mechanics: number;
  total_mechanics: number;
  new_customers_this_month: number;
}

export interface BookingsOverTimeEntry {
  date: string;
  total_bookings?: number;
  count?: number;
  completed?: number;
  in_progress?: number;
  pending?: number;
  cancelled?: number;
}

export interface RevenueOverTimeEntry {
  date: string;
  revenue: string;
  completed_jobs?: number;
  avg_ticket?: string;
}

export interface StatusDistributionEntry {
  status: string;
  status_display: string;
  count: number;
  percentage: number;
}

export interface ServiceBreakdownCategory {
  category_name: string;
  total_bookings: number;
  total_revenue: string;
}

export interface ServiceBreakdownService {
  service_name: string;
  category_name: string;
  total_bookings: number;
  total_revenue: string;
}

export interface ServiceBreakdownData {
  by_category: ServiceBreakdownCategory[];
  top_services: ServiceBreakdownService[];
}
