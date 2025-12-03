import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, className = '', onClick, style }: CardProps) {
  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-lg p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:bg-neutral-800 hover:border-neutral-700 hover:shadow-lg hover:shadow-neutral-900/50 hover:-translate-y-0.5' : ''
      } ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
