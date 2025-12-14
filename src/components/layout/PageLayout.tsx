import { ReactNode } from 'react';
import { Footer as UserFooter } from '@cybernixvn/footer-protect';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-900 to-black text-white smooth-fade-in">
      <div className="flex-1 min-h-full">
        {children}
      </div>
      <UserFooter />
    </div>
  );
}
