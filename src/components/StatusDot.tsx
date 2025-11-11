import clsx from 'clsx';

interface StatusDotProps {
  status: 'online' | 'offline' | 'warning';
  className?: string;
}

export const StatusDot = ({ status, className }: StatusDotProps) => {
  const statusClasses = {
    online: 'bg-success',
    warning: 'bg-warning',
    offline: 'bg-danger',
  };

  return (
    <span
      className={clsx(
        'inline-block w-2.5 h-2.5 rounded-full',
        statusClasses[status],
        className
      )}
      aria-label={status}
    />
  );
};
