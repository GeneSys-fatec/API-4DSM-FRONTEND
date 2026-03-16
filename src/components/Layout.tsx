import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.tsx";
import { Header } from "./Header.tsx";

export function Layout() {
  return (
    <div className="flex flex-col h-screen w-full bg-bg-dashboard overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
