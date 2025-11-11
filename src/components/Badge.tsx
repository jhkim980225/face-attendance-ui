import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'info', children, className }: BadgeProps) => {
  const variantClasses = {
    success: 'bg-green-900/30 text-green-400 border-green-700',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
    danger: 'bg-red-900/30 text-red-400 border-red-700',
    info: 'bg-blue-900/30 text-blue-400 border-blue-700',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
