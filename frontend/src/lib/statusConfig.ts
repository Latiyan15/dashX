/**
 * Centralized Canonical Booking Status Taxonomy & Color System.
 *
 * Canonical Dashboard Presentation Statuses:
 * 1. Pending (amber)
 * 2. Assigned (blue/cool neutral)
 * 3. On The Way (amber-orange)
 * 4. Completed (teal/emerald)
 * 5. Cancelled (red)
 *
 * "In Progress" is mapped to canonical presentation according to the system rules.
 */

export type CanonicalStatusKey =
  | 'PENDING'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface StatusConfigItem {
  key: CanonicalStatusKey;
  label: string;
  hex: string;
  dotClass: string;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const CANONICAL_STATUS_CONFIG: Record<CanonicalStatusKey, StatusConfigItem> = {
  PENDING: {
    key: 'PENDING',
    label: 'Pending',
    hex: '#F59E0B',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-500',
    borderClass: 'border-amber-500/30',
  },
  ASSIGNED: {
    key: 'ASSIGNED',
    label: 'Assigned',
    hex: '#3B82F6',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
  },
  ON_THE_WAY: {
    key: 'ON_THE_WAY',
    label: 'On The Way',
    hex: '#F97316',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
  },
  COMPLETED: {
    key: 'COMPLETED',
    label: 'Completed',
    hex: '#10B981',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Cancelled',
    hex: '#EF4444',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
  },
};

/**
 * Normalizes any backend status (including legacy IN_PROGRESS) to a canonical presentation key.
 */
export function normalizeToCanonicalStatus(status: string | null | undefined): CanonicalStatusKey {
  if (!status) return 'PENDING';
  const upper = status.toUpperCase().trim();
  if (upper === 'IN_PROGRESS' || upper === 'ON_THE_WAY') return 'ON_THE_WAY';
  if (upper === 'ASSIGNED') return 'ASSIGNED';
  if (upper === 'COMPLETED') return 'COMPLETED';
  if (upper === 'CANCELLED') return 'CANCELLED';
  if (upper === 'PENDING') return 'PENDING';
  return 'PENDING';
}

/**
 * Gets canonical status display configuration for any status string.
 */
export function getStatusConfig(status: string | null | undefined): StatusConfigItem {
  const canonicalKey = normalizeToCanonicalStatus(status);
  return CANONICAL_STATUS_CONFIG[canonicalKey];
}

/**
 * Formats a status string for UI display strictly adhering to canonical 5 labels.
 */
export function formatCanonicalStatusLabel(status: string | null | undefined): string {
  return getStatusConfig(status).label;
}
