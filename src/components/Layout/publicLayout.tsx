import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import { PublicSidebar } from "../PublicSidebar";

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-bg-dashboard overflow-hidden">
      <Header toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        <PublicSidebar
          isOpen={isMobileMenuOpen}
          closeMenu={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}