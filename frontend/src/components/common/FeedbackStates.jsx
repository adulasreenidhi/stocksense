import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import Card from './Card';
import { Inbox, Plus, RefreshCw } from 'lucide-react';

/**
 * Base shimmer block for skeleton loading
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] border border-white/[0.04] ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton loader for Nike-style oversized KPI Cards
 */
export function KPICardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}

/**
 * Skeleton loader for Data Tables
 */
export function TableSkeleton({ rows = 4, cols = 5 }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="divide-y divide-white/[0.05] p-2 space-y-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between p-3 gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Styled Empty State Component
 * Replaces bare "No data" text with a polished dark-glass card with icon, microcopy, and primary CTA.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are no active entries matching your criteria in this operational queue.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        className={`p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-4 bg-surface/75 border-dashed border-white/[0.12] ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-neutral-300 shadow-inner">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>

        <div className="max-w-md space-y-1.5">
          <h3 className="font-display font-extrabold text-xl text-white tracking-tight uppercase">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {secondaryActionLabel && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSecondaryAction}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                {secondaryActionLabel}
              </Button>
            )}
            {actionLabel && (
              <Button
                variant="primary"
                size="md"
                onClick={onAction}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
