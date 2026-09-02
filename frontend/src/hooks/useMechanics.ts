import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanicService, type MechanicQueryParams } from '../services/mechanics';
import type { PaginatedResponse, Mechanic } from '../types';

export function useMechanics(params: MechanicQueryParams = {}) {
  return useQuery<PaginatedResponse<Mechanic>>({
    queryKey: ['mechanics', params],
    queryFn: () => mechanicService.getMechanics(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateMechanicStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: string;
    }) => mechanicService.updateMechanicStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
    },
  });
}
