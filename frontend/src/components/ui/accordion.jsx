import * as React from 'react';
import { cn } from '../../lib/cn.js';

const AccordionCtx = React.createContext(null);

export function Accordion({ type = 'single', collapsible = true, className, children, ...props }) {
  const [open, setOpen] = React.useState(null);
  return (
    <AccordionCtx.Provider value={{ type, collapsible, open, setOpen }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </AccordionCtx.Provider>
  );
}

export function AccordionItem({ value, className, children }) {
  const ctx = React.useContext(AccordionCtx);
  if (!ctx) throw new Error('AccordionItem must be used within Accordion');
  const isOpen = ctx.open === value;
  return (
    <div className={cn('card-ink', className)} data-state={isOpen ? 'open' : 'closed'}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { _value: value });
      })}
    </div>
  );
}

export function AccordionTrigger({ className, children, _value, ...props }) {
  const ctx = React.useContext(AccordionCtx);
  const isOpen = ctx.open === _value;

  const toggle = () => {
    if (isOpen) {
      if (ctx.collapsible) ctx.setOpen(null);
      return;
    }
    ctx.setOpen(_value);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={isOpen}
      className={cn(
        'w-full flex items-center justify-between gap-4 p-[var(--space-5)] text-left cursor-pointer',
        'text-text font-semibold',
        className,
      )}
      {...props}
    >
      <span className="text-base font-bold">{children}</span>
      <span className={cn('text-muted transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}>▾</span>
    </button>
  );
}

export function AccordionContent({ className, children, _value, ...props }) {
  const ctx = React.useContext(AccordionCtx);
  const isOpen = ctx.open === _value;
  return (
    <div
      hidden={!isOpen}
      className={cn('px-[var(--space-5)] pb-[var(--space-5)] text-sm text-muted leading-[var(--leading-body)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

