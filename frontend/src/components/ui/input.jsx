import * as React from 'react';
import { cn } from '../../lib/cn.js';

export const Input = React.forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-text shadow-sm cursor-text ' +
          'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      )}
      {...props}
    />
  );
});

