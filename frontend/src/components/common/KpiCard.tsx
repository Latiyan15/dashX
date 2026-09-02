import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  trendText?: string;
  trendType?: 'up' | 'down' | 'neutral';
  comparisonText?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  progressPercent?: number;
  progressText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trendText,
  trendType = 'up',
  comparisonText = 'vs last week',
  icon: Icon,
  iconBgColor = 'bg-teal-950/50 border border-teal-500/30',
  iconColor = 'text-teal-400',
  progressPercent,
  progressText,
}) => {
  const trendColorClass =
    trendType === 'up'
      ? 'text-emerald-400'
      : trendType === 'down'
      ? 'text-amber-400'
      : 'text-rose-500';

  const trendIcon =
    trendType === 'up' ? '↑' : trendType === 'down' ? '↓' : '↑';

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-[#131317] rounded-xl border border-[#1f1f26] p-3 sm:p-3.5 flex flex-col justify-between shadow-lg min-h-[120px]"
    >
      {/* Top Header: Icon + Uppercase Title - Never truncated */}
      <div className="flex items-start gap-2 min-w-0">
        <div className={`w-6 h-6 rounded-md ${iconBgColor} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 leading-tight min-w-0 break-words flex-1">
          {title}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono leading-none">
          {value}
        </div>
      </div>

      {/* Progress Bar (for Active Mechanics) */}
      {typeof progressPercent === 'number' && (
        <div className="my-1 space-y-1">
          {progressText && (
            <span className="text-[10px] text-slate-400 font-mono block">
              {progressText}
            </span>
          )}
          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
            <div
              className="h-1 rounded-full bg-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Trend Subtext */}
      {trendText && (
        <div className="flex items-center gap-1 text-[11px] flex-wrap">
          <span className={`font-bold font-mono text-[10px] sm:text-[11px] ${trendColorClass} shrink-0`}>
            {trendIcon} {trendText}
          </span>
          <span className="text-slate-500 text-[10px] sm:text-[11px] truncate">{comparisonText}</span>
        </div>
      )}
    </motion.div>
  );
};
