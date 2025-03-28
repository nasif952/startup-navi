
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export function Card({ className, children, title, action }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-md",
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          {title && <h3 className="font-medium text-lg">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
