import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const Card = forwardRef(function Card(
  { className, children, hoverEffect = true, glow = false, whileHover, ...props },
  ref
) {
  const hoverAnimation = hoverEffect
    ? whileHover || { y: -3, transition: { duration: 0.18, ease: 'easeOut' } }
    : undefined;

  return (
    <motion.div
      ref={ref}
      whileHover={hoverAnimation}
      className={cn(
        'relative rounded-2xl bg-surface/90 border border-white/[0.08] backdrop-blur-md overflow-hidden transition-colors duration-200',
        hoverEffect &&
          'hover:border-white/[0.22] hover:bg-surface hover:shadow-card-hover group',
        glow && 'shadow-card-glow',
        className
      )}
      {...props}
    >
      {/* Scrim highlight line across top border for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 pb-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'font-display font-bold text-lg text-white tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-xs font-medium text-neutral-400 tracking-normal', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-6 pt-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-6 pt-0 border-t border-white/[0.06] mt-4 pt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Nike-style Hero KPI Stat Card
 * Oversized bold typography, punchy micro-tag, trend indicator, and generous negative space.
 */
export function CardStat({
  label,
  value,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  subtext,
  badgeText,
  icon: Icon,
  className,
  valueClassName,
  ...props
}) {
  const isUp = trendDirection === 'up';
  const isDown = trendDirection === 'down';

  return (
    <Card className={cn('p-6 flex flex-col justify-between group', className)} {...props}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            {label}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-white/[0.2] transition-colors">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {badgeText && !Icon && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-neutral-300">
              {badgeText}
            </span>
          )}
        </div>

        {/* Oversized Nike-style hero stat number */}
        <div
          className={cn(
            'font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tighter leading-none mb-3',
            valueClassName
          )}
        >
          {value}
        </div>
      </div>

      {(trend || subtext) && (
        <div className="flex items-center gap-2 pt-2 text-xs font-medium">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-semibold',
                isUp && 'bg-status-success/15 text-emerald-400 border border-status-success/25',
                isDown && 'bg-status-danger/15 text-red-400 border border-status-danger/25',
                !isUp && !isDown && 'bg-white/[0.08] text-neutral-300 border border-white/[0.1]'
              )}
            >
              {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
              {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
              {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
          {subtext && <span className="text-neutral-400 text-xs truncate">{subtext}</span>}
        </div>
      )}
    </Card>
  );
}

export default Card;
