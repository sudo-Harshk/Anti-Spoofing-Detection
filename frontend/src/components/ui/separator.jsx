import * as React from 'react';
import { cn } from '../../lib/cn.js';

export const Separator = React.forwardRef(function Separator(
  { className, orientation = 'horizontal', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-border',
        orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full',
        className,
      )}
      {...props}
    />
  );
});

