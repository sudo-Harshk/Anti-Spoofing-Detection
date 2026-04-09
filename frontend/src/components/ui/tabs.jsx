import * as React from 'react';
import { cn } from '../../lib/cn.js';

const TabsCtx = React.createContext(null);

export function Tabs({ value, defaultValue, onValueChange, className, children }) {
  const isControlled = value != null;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = isControlled ? value : internal;

  const setValue = React.useCallback(
    (v) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsCtx.Provider value={{ value: current, setValue }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-2 rounded-full bg-white/70 border border-border p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
        selected ? 'bg-primary text-white' : 'text-text hover:bg-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');
  if (ctx.value !== value) return null;

  return (
    <div role="tabpanel" className={cn('mt-6', className)} {...props}>
      {children}
    </div>
  );
}

