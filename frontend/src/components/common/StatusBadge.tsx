import React from 'react';
import { getStatusConfig } from '../../lib/statusConfig';

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showDot = true,
}) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight border shadow-xs transition-all ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotClass} ${
            config.key === 'ON_THE_WAY' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
