import * as React from 'react';
import { cn } from '../../lib/cn.js';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors ' +
  'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';

const variants = {
  default: 'bg-primary text-white hover:bg-[#1842B5] shadow-sm',
  secondary: 'bg-accent-blue-light text-text border border-border hover:bg-white',
  ghost: 'bg-transparent text-text hover:bg-white/60',
};

const sizes = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  lg: 'h-12 px-7 text-base rounded-full',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant] ?? variants.default, sizes[size] ?? sizes.md, className)}
      {...props}
    />
  );
});

