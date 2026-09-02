import api from './api';
import type { Mechanic, MechanicStatus, PaginatedResponse } from '../types';
import { mockMechanics } from './mockData';

export interface MechanicQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  ordering?: string;
}

let localMechanics = [...mockMechanics];

export const mechanicService = {
  getMechanics: async (params?: MechanicQueryParams): Promise<PaginatedResponse<Mechanic>> => {
    try {
      const { data } = await api.get('/mechanics/', { params });
      return data;
    } catch {
      let filtered = [...localMechanics];
      if (params?.status) {
        filtered = filtered.filter((m) => m.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.full_name.toLowerCase().includes(q) ||
            m.specialization.toLowerCase().includes(q) ||
            m.phone.toLowerCase().includes(q)
        );
      }
      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      };
    }
  },

  getMechanicById: async (id: number | string): Promise<Mechanic> => {
    try {
      const { data } = await api.get(`/mechanics/${id}/`);
      return data;
    } catch {
      return localMechanics.find((m) => String(m.id) === String(id)) || localMechanics[0];
    }
  },

  updateMechanicStatus: async (
    id: number | string,
    payload: { status: string }
  ): Promise<Mechanic> => {
    try {
      const { data } = await api.patch(`/mechanics/${id}/status/`, payload);
      return data;
    } catch {
      localMechanics = localMechanics.map((m) =>
        String(m.id) === String(id)
          ? {
              ...m,
              status: payload.status as MechanicStatus,
              status_display: payload.status.replace(/_/g, ' '),
            }
          : m
      );
      return mechanicService.getMechanicById(id);
    }
  },
};
