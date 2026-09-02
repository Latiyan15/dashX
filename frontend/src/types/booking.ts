// Booking types matching Django backend models
export interface BookingCustomer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
}

export interface BookingVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  fuel_type: string;
  mileage: number;
  display_name: string;
}

export interface BookingService {
  id: number;
  name: string;
  category_name: string;
  category_slug: string;
  base_price: string;
  estimated_duration_minutes: number;
}

export interface BookingMechanic {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  status_display: string;
  rating: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BookingStatusHistoryEntry {
  id: number;
  from_status: string | null;
  to_status: string;
  changed_by: string;
  notes: string;
  created_at: string;
}

export interface Booking {
  id: number;
  reference_code: string;
  customer: BookingCustomer;
  vehicle: BookingVehicle;
  service: BookingService;
  mechanic: BookingMechanic | null;
  status: BookingStatus;
  status_display: string;
  scheduled_at: string;
  completed_at: string | null;
  base_price: string;
  additional_charges: string;
  total_amount: string;
  service_location: string;
  created_at: string;
}

export interface BookingDetail extends Booking {
  customer_notes: string;
  mechanic_notes: string;
  status_history: BookingStatusHistoryEntry[];
}

// Valid transitions map (mirrors Django BookingService.VALID_TRANSITIONS)
export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ON_THE_WAY', 'IN_PROGRESS', 'CANCELLED'],
  ON_THE_WAY: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
  ON_THE_WAY: 'bg-purple-100 text-purple-800 border-purple-200',
  IN_PROGRESS: 'bg-orange-100 text-orange-800 border-orange-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  ON_THE_WAY: 'On The Way',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
