import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OfflineBanner from './OfflineBanner';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-card flex-col z-50 shadow-sm border-r border-border-subtle">
        <Sidebar />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-surface-card flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Header */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Main content area — offset by sidebar on desktop, by header on all */}
      <main className="pt-16 lg:pl-72 min-h-screen flex flex-col">
        <OfflineBanner />
        <div className="px-4 sm:px-6 py-6 pb-12 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
