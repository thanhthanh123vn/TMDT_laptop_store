import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import LoginPromptDialog from './LoginPromptDialog';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
      <Footer />
      <LoginPromptDialog />
    </div>
  );
};
