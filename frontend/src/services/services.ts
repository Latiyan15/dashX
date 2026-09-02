import api from './api';
import type { Service, ServiceCategory } from '../types';

export const serviceCatalogService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    const { data } = await api.get('/service-categories/');
    return data;
  },

  getServices: async (): Promise<Service[]> => {
    const { data } = await api.get('/services/');
    return data;
  },
};
