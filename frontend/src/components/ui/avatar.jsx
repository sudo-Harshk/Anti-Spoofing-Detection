import * as React from 'react';
import { cn } from '../../lib/cn.js';

export const Avatar = React.forwardRef(function Avatar({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border', className)}
      {...props}
    />
  );
});

export const AvatarImage = React.forwardRef(function AvatarImage({ className, ...props }, ref) {
  return <img ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />;
});

export const AvatarFallback = React.forwardRef(function AvatarFallback({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-accent-blue-light text-xs font-bold text-text',
        className,
      )}
      {...props}
    />
  );
});

