import api from './api';
import type { Mechanic, PaginatedResponse } from '../types';

export interface MechanicQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  ordering?: string;
}

export const mechanicService = {
  getMechanics: async (params?: MechanicQueryParams): Promise<PaginatedResponse<Mechanic>> => {
    const { data } = await api.get('/mechanics/', { params });
    return data;
  },

  getMechanicById: async (id: number | string): Promise<Mechanic> => {
    const { data } = await api.get(`/mechanics/${id}/`);
    return data;
  },

  updateMechanicStatus: async (
    id: number | string,
    payload: { status: string }
  ): Promise<Mechanic> => {
    const { data } = await api.patch(`/mechanics/${id}/status/`, payload);
    return data;
  },
};
