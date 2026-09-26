import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  // Nike-inspired solid high-contrast punchy accent button with soft glow
  primary:
    'bg-accent text-white font-semibold shadow-accent-glow hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,85,0,0.6)] active:bg-accent-active active:scale-[0.98] border border-transparent',
  
  // Discord-inspired translucent glass surface with razor border & soft hover lift
  secondary:
    'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-100 font-medium border border-white/[0.1] hover:border-white/[0.22] backdrop-blur-md active:bg-white/[0.08] active:scale-[0.98] shadow-sm',

  // Destructive late / stock-out / cancel action
  destructive:
    'bg-status-danger/15 text-red-300 font-medium border border-status-danger/30 hover:bg-status-danger/25 hover:border-status-danger/50 hover:text-white shadow-danger-glow active:scale-[0.98]',

  // Ghost clean minimal trigger
  ghost:
    'bg-transparent text-neutral-300 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] border border-transparent font-medium',

  // Outline crisp border
  outline:
    'bg-transparent text-neutral-200 border border-white/[0.14] hover:bg-white/[0.06] hover:border-white/[0.3] hover:text-white active:scale-[0.98] font-medium',
};

const SIZES = {
  xs: 'h-7 px-2.5 text-xs rounded-lg gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-xl gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2.5 font-semibold',
  icon: 'h-10 w-10 p-0 rounded-xl justify-center items-center',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg justify-center items-center',
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    type = 'button',
    ...props
  },
  ref
) {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center font-display transition-all duration-150 ease-out select-none outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
