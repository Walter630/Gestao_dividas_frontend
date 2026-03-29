import React from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';
import { InstallBanner } from '../ui/InstallBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex bg-dark-900 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <InstallBanner />
      <Toaster theme="dark" position="top-right" />
    </div>
  );
};

