import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-900 to-black text-white smooth-fade-in">
      <div className="min-h-full">
        {children}
      </div>
    </div>
  );
}
