import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-surface/60 backdrop-blur-md">
      <table
        className={cn('w-full text-left text-sm border-collapse text-neutral-300', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn('bg-white/[0.03] border-b border-white/[0.08] text-xs font-semibold text-neutral-400 uppercase tracking-wider font-display', className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-white/[0.05]', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, isClickable = false, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100',
        isClickable ? 'cursor-pointer hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th className={cn('px-4 py-3.5 select-none font-semibold', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, mono = false, ...props }) {
  return (
    <td
      className={cn('px-4 py-3 text-neutral-200', mono && 'font-mono text-xs text-neutral-300', className)}
      {...props}
    >
      {children}
    </td>
  );
}

export default Table;
