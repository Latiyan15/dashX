// Customer & Vehicle types matching Django backend
export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  fuel_type: string;
  fuel_type_display: string;
  mileage: number;
  display_name: string;
  created_at: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  vehicle_count: number;
  booking_count: number;
  total_spend: string;
  created_at: string;
}

export interface CustomerDetail extends Customer {
  vehicles: Vehicle[];
}
