import api from './api';
import type { Service, ServiceCategory } from '../types';

const mockCategories: ServiceCategory[] = [
  { id: 1, name: 'Periodic Maintenance', slug: 'periodic-maintenance', icon: 'Wrench', description: 'Scheduled fluid changes and multi-point inspections', is_active: true, services_count: 4, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Engine Tuning & Diagnostics', slug: 'engine-tuning', icon: 'Cpu', description: 'ECU telemetry, timing and sensor calibration', is_active: true, services_count: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: 3, name: 'Braking & Suspension', slug: 'braking-suspension', icon: 'Disc', description: 'Rotors, ceramic pads and active strut overhauls', is_active: true, services_count: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: 4, name: 'Electrical & AC Telemetry', slug: 'electrical-ac', icon: 'Zap', description: 'Climate control loops and battery diagnostics', is_active: true, services_count: 2, created_at: '2026-01-01T00:00:00Z' },
];

const mockServicesList: Service[] = [
  { id: 1, category: 1, category_name: 'Periodic Maintenance', category_slug: 'periodic-maintenance', name: 'Comprehensive Full Synthetic Service', description: 'Engine oil, oil filter, air filter, and 40-point safety check', base_price: '2899.00', estimated_duration_minutes: 120, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, category: 2, category_name: 'Engine Tuning & Diagnostics', category_slug: 'engine-tuning', name: 'Stage-1 OBD ECU Diagnostic & Tune', description: 'OBD live scan, throttle response tune, spark plug check', base_price: '3499.00', estimated_duration_minutes: 90, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 3, category: 3, category_name: 'Braking & Suspension', category_slug: 'braking-suspension', name: 'Ceramic Brake Pad & Rotor Replacement', description: 'Brembo OEM-spec ceramic pads with rotor resurfacing', base_price: '4800.00', estimated_duration_minutes: 150, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 4, category: 4, category_name: 'Electrical & AC Telemetry', category_slug: 'electrical-ac', name: 'Climate Control Overhaul & Gas Recharge', description: 'R134a refrigerant recharge, condenser decontamination', base_price: '2100.00', estimated_duration_minutes: 60, is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

export const serviceCatalogService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    try {
      const { data } = await api.get('/service-categories/');
      return data;
    } catch {
      return mockCategories;
    }
  },

  getServices: async (): Promise<Service[]> => {
    try {
      const { data } = await api.get('/services/');
      return data;
    } catch {
      return mockServicesList;
    }
  },
};
