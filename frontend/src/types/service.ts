// Service types matching Django backend
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  is_active: boolean;
  services_count: number;
  created_at: string;
}

export interface Service {
  id: number;
  category: number;
  category_name: string;
  category_slug: string;
  name: string;
  description: string;
  base_price: string;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}
