import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import type { OverviewData } from '../types';

export function useOverview() {
  return useQuery<OverviewData>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsService.getOverview(),
    staleTime: 30000,
  });
}
