import React from 'react';

interface VehicleBrandBadgeProps {
  make: string;
  className?: string;
}

export const VehicleBrandBadge: React.FC<VehicleBrandBadgeProps> = ({ make, className = '' }) => {
  // Normalize make name
  const cleanMake = make.trim();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100/80 text-slate-800 border border-slate-200/80 tracking-tight ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
      {cleanMake}
    </span>
  );
};
