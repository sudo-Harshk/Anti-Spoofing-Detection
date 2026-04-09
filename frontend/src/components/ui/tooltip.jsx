import * as React from 'react';
import { cn } from '../../lib/cn.js';

const TooltipCtx = React.createContext(null);

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative inline-flex">
      <TooltipCtx.Provider value={{ open, setOpen }}>{children}</TooltipCtx.Provider>
    </span>
  );
}

export function TooltipTrigger({ asChild = false, children, ...props }) {
  const ctx = React.useContext(TooltipCtx);
  if (!ctx) throw new Error('TooltipTrigger must be used within Tooltip');

  const triggerProps = {
    onMouseEnter: () => ctx.setOpen(true),
    onMouseLeave: () => ctx.setOpen(false),
    onFocus: () => ctx.setOpen(true),
    onBlur: () => ctx.setOpen(false),
    ...props,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps);
  }

  return (
    <span tabIndex={0} className="inline-flex" {...triggerProps}>
      {children}
    </span>
  );
}

export function TooltipContent({ className, sideOffset = 8, children, ...props }) {
  const ctx = React.useContext(TooltipCtx);
  if (!ctx || !ctx.open) return null;

  return (
    <div
      role="tooltip"
      style={{ marginTop: sideOffset }}
      className={cn(
        'absolute z-50 mt-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text shadow-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

