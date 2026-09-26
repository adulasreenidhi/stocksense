import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(function Input(
  {
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    shortcut,
    disabled = false,
    ...props
  },
  ref
) {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-neutral-200 font-display uppercase tracking-wider flex items-center justify-between">
          <span>{label}</span>
          {shortcut && (
            <kbd className="text-[10px] uppercase font-mono text-neutral-300 bg-white/[0.08] border border-white/[0.12] px-1.5 py-0.5 rounded">
              {shortcut}
            </kbd>
          )}
        </label>
      )}

      <div className="relative flex items-center group">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-white transition-colors">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full h-10 rounded-xl bg-canvas-subtle/90 text-white placeholder:text-neutral-400 text-sm font-medium',
            'border border-white/[0.1] backdrop-blur-md',
            'transition-all duration-150 ease-out',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 focus:bg-canvas',
            'hover:border-white/[0.2]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-3.5',
            rightIcon || shortcut ? 'pr-12' : 'pr-3.5',
            error && 'border-status-danger/70 focus:border-status-danger focus:ring-status-danger/40 text-red-200',
            className
          )}
          {...props}
        />

        {shortcut && !rightIcon && (
          <div className="absolute right-3 pointer-events-none flex items-center">
            <kbd className="text-[10px] font-mono text-neutral-400 bg-white/[0.08] border border-white/[0.12] px-1.5 py-0.5 rounded">
              {shortcut}
            </kbd>
          </div>
        )}

        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-status-danger mt-1 flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-neutral-400 mt-0.5 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
