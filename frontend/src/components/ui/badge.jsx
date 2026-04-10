import * as React from 'react';
import { cn } from '../../lib/cn.js';

const variants = {
  default: 'bg-accent-blue-light text-text border border-border',
  primary: 'bg-primary text-white',
  secondary: 'bg-[#E9F6EF] text-[#1F5E3F] border border-[#BFE3D3]',
  outline: 'bg-transparent text-text border border-border',
  warn: 'bg-[#FFF2D1] text-[#7A4B00] border border-[#F2D58A]',
};

export const Badge = React.forwardRef(function Badge({ className, variant = 'default', ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-[var(--radius-full)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-semibold',
        variants[variant] ?? variants.default,
        className,
      )}
      {...props}
    />
  );
});

