import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const DropdownContext = createContext(null);

export function Dropdown({ children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ children, className, asChild = false, showChevron = false }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);

  const toggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: toggle,
      'aria-expanded': isOpen,
      'data-state': isOpen ? 'open' : 'closed',
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150',
        'text-neutral-300 hover:text-white hover:bg-white/[0.06]',
        isOpen && 'bg-white/[0.08] text-white',
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      {showChevron && (
        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-white'
          )}
        />
      )}
    </button>
  );
}

export function DropdownContent({
  children,
  align = 'left',
  width = 'w-56',
  className,
}) {
  const { isOpen } = useContext(DropdownContext);

  if (!isOpen) return null;

  const alignStyles =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <div
      className={cn(
        'absolute mt-2 z-50 p-1.5 rounded-xl',
        'bg-[#121316]/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl',
        'animate-in fade-in zoom-in-95 duration-150',
        alignStyles,
        width,
        className
      )}
      role="menu"
    >
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  destructive = false,
  disabled = false,
  badge,
  className,
  ...props
}) {
  const { setIsOpen } = useContext(DropdownContext);

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left select-none outline-none transition-colors duration-100',
        destructive
          ? 'text-status-danger hover:bg-status-danger/15 hover:text-red-300'
          : 'text-neutral-300 hover:text-white hover:bg-white/[0.08]',
        disabled && 'opacity-40 pointer-events-none cursor-not-allowed',
        className
      )}
      role="menuitem"
      {...props}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" />}
        <span>{children}</span>
      </div>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  );
}

export function DropdownHeader({ title, subtitle, className }) {
  return (
    <div className={cn('px-3 py-2 border-b border-white/[0.06] mb-1', className)}>
      <div className="text-xs font-semibold text-white font-display">{title}</div>
      {subtitle && <div className="text-[11px] text-neutral-400 truncate">{subtitle}</div>}
    </div>
  );
}

export function DropdownSeparator({ className }) {
  return <div className={cn('h-px my-1 bg-white/[0.08]', className)} />;
}

export default Dropdown;
