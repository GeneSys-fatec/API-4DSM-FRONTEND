import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const isMapRoute = location.pathname.includes('/mapa');

  return (
    <div className="flex flex-col h-screen w-full bg-bg-dashboard overflow-hidden">
      <Header toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isMobileMenuOpen}
          closeMenu={() => setIsMobileMenuOpen(false)}
        />

        <main
          className={`flex-1 overflow-y-auto ${!isMapRoute ? 'px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6' : ''}`}
          style={{ isolation: "isolate" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
