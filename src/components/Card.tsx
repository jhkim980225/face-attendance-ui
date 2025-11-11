import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'danger';
}

export const Card = ({ children, className, variant = 'default' }: CardProps) => {
  const variantClasses = {
    default: 'border-border',
    success: 'border-success',
    danger: 'border-danger',
  };

  return (
    <div
      className={clsx(
        'bg-surface rounded-lg border-2 p-4',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
