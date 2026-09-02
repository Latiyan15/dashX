// Mechanic types matching Django backend
export type MechanicStatus = 'AVAILABLE' | 'BUSY' | 'ON_TRIP' | 'OFFLINE';

export interface MechanicActiveBooking {
  id: number;
  reference_code: string;
  customer_name: string;
  vehicle_info: string;
  license_plate: string;
  service_name: string;
  status: string;
  scheduled_at: string;
}

export interface Mechanic {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  status: MechanicStatus;
  status_display: string;
  rating: string;
  total_jobs_completed: number;
  specialization: string;
  avatar_url: string;
  experience_years: number;
  current_latitude: string | null;
  current_longitude: string | null;
  active_booking: MechanicActiveBooking | null;
  created_at: string;
}

export const MECHANIC_STATUS_COLORS: Record<MechanicStatus, string> = {
  AVAILABLE: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
  BUSY: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
  ON_TRIP: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
  OFFLINE: 'bg-slate-800/60 text-slate-400 border-slate-600/30',
};
