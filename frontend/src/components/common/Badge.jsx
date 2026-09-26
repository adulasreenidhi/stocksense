import React from 'react';
import { cn } from '../../lib/utils';

const BADGE_VARIANTS = {
  // Status: Done / Stock-in / Complete
  done: 'bg-status-success/15 text-emerald-400 border-status-success/30 hover:border-status-success/50',
  success: 'bg-status-success/15 text-emerald-400 border-status-success/30 hover:border-status-success/50',

  // Status: Waiting / Pending / In-Transit
  waiting: 'bg-status-warning/15 text-amber-300 border-status-warning/30 hover:border-status-warning/50',
  warning: 'bg-status-warning/15 text-amber-300 border-status-warning/30 hover:border-status-warning/50',

  // Status: Late / Stock-out / Error
  late: 'bg-status-danger/15 text-red-400 border-status-danger/30 hover:border-status-danger/50',
  danger: 'bg-status-danger/15 text-red-400 border-status-danger/30 hover:border-status-danger/50',

  // Brand Accent: Active / Live / Spotlight
  accent: 'bg-accent/15 text-[#FF7A33] border-accent/35 hover:border-accent/60',

  // Info
  info: 'bg-status-info/15 text-sky-400 border-status-info/30 hover:border-status-info/50',

  // Neutral / Draft
  neutral: 'bg-white/[0.06] text-neutral-300 border-white/[0.1] hover:border-white/[0.2]',
  outline: 'bg-transparent text-neutral-300 border-white/[0.18]',
};

const DOT_COLORS = {
  done: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
  success: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
  waiting: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  warning: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  late: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
  danger: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
  accent: 'bg-accent shadow-[0_0_8px_rgba(255,85,0,0.8)]',
  info: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
  neutral: 'bg-neutral-400',
  outline: 'bg-neutral-400',
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1.5',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className,
  ...props
}) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;
  const sizeClass = SIZES[size] || SIZES.md;
  const dotColorClass = DOT_COLORS[variant] || DOT_COLORS.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center font-display font-medium rounded-full border backdrop-blur-md uppercase tracking-wider transition-colors select-none',
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColorClass
              )}
            />
          )}
          <span
            className={cn('relative inline-flex rounded-full h-2 w-2', dotColorClass)}
          />
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
