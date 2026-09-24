import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OfflineBanner from './OfflineBanner';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Determine active portal context based on route
  const isProcurementRoute =
    location.pathname.startsWith('/tenders') ||
    location.pathname.startsWith('/procurement-dashboard') ||
    location.pathname.startsWith('/vendors');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar (Fixed Left, Width 16rem / 256px) */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40 bg-white border-r border-slate-200">
        <Sidebar isProcurement={isProcurementRoute} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
          {/* Drawer */}
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              isProcurement={isProcurementRoute}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Top Header — Fixed Top, offset by sidebar width on desktop */}
      <Header
        isProcurement={isProcurementRoute}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Main Content Area — Offset by header height (pt-16) and sidebar width (lg:pl-64) */}
      <main className="pt-16 lg:pl-64 min-h-screen flex flex-col">
        <OfflineBanner />
        <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
