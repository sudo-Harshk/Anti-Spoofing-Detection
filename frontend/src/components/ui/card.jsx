import * as React from 'react';
import { cn } from '../../lib/cn.js';

export const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn('card-premium', className)} {...props} />;
});

export const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-6 pb-3', className)} {...props} />;
});

export const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return <h3 ref={ref} className={cn('text-xl font-bold tracking-tight text-text', className)} {...props} />;
});

export const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('text-sm text-muted leading-relaxed', className)} {...props} />;
});

export const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />;
});

export const CardFooter = React.forwardRef(function CardFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-6 pt-0 flex items-center', className)} {...props} />;
});

