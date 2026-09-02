export * from './booking';
export * from './customer';
export * from './mechanic';
export * from './service';
export * from './analytics';
export * from './websocket';

// Generic paginated response from DRF
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
