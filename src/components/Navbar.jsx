import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, UserCircle, X } from "lucide-react";
import SearchBar from './SearchBar'
import DashboardSidebar from './DashboardSidebar'

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  // ✅ Ambil data user & sinkronisasi login/logout otomatis
  useEffect(() => {
    const loadUser = () => {
      const stored = sessionStorage.getItem("mc_user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    loadUser(); // Cek pertama kali saat komponen dimount

    // Dengarkan perubahan storage (tab lain) dan event custom
    window.addEventListener("storage", loadUser);
    window.addEventListener("mc_auth_change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("mc_auth_change", loadUser);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("mc_user");
    window.dispatchEvent(new Event("mc_auth_change")); // kasih sinyal global
    setUser(null);
    nav("/"); // arahkan ke beranda
  };

  // dropdown removed: clicking profile now navigates to profile page directly

  // Scroll helper: navigate to the proper landing (home or dashboard) then scroll to section id
  function goToSection(id) {
    const current = window.location.pathname;

    // Always target the public landing for anchors (home sections live there)
    // This makes Home/About/Contact work even for logged-in users.
    const targetPath = "/";

    // If already on the target path, scroll directly
    if (current === targetPath || current.startsWith(targetPath + "/")) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Not on target: navigate there then scroll after a short delay
    nav(targetPath);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);
  }

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center">
        {/* Left: Logo */}
        <div className="flex items-center mr-4">
          <Link to={user ? "/dashboard" : "/"} className="font-bold text-xl text-sky-600 tracking-tight">
            Move &amp; Clean
          </Link>
        </div>

        {/* Center: Navigation */}
        <div className="flex-1 hidden md:flex justify-center">
          <nav className="space-x-8 text-slate-700">
            <button onClick={() => goToSection('services')} className="hover:text-sky-600 transition text-sm">Home</button>
            <button onClick={() => goToSection('about')} className="hover:text-sky-600 transition text-sm">About</button>
            <button onClick={() => goToSection('contact')} className="hover:text-sky-600 transition text-sm">Contact</button>
          </nav>
        </div>

        {/* Right: search, user/menu, sidebar toggle */}
          <div className="flex items-center gap-3">
          {(!location.pathname || (!location.pathname.startsWith('/profile') && !location.pathname.startsWith('/dashboard/profile'))) && <SearchBar />}

          {/* Desktop auth / profile area */}
          <div className="hidden md:flex items-center">
            {user ? (
              <Link to="/dashboard/profile" className="flex items-center gap-2 hover:text-sky-600">
                <UserCircle className="w-7 h-7 text-sky-600" />
                <span className="text-sm font-medium">{user.name}</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-3 py-1 border rounded-md hover:bg-sky-50 text-sm"
              >
                Masuk
              </Link>
            )}
          </div>

            {/* Sidebar toggle (mobile + desktop) - only for authenticated users */}
            {user && (
              <button
                className="p-2 text-slate-600 hover:text-sky-600"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Toggle navigation sidebar"
              >
                <Menu size={22} />
              </button>
            )}
        </div>
      </div>
      {/* Global sidebar panel (anchored below navbar) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute top-16 right-0 h-[calc(100vh-4rem)] w-72 sm:w-80 bg-gradient-to-b from-white via-slate-50 to-white border-l p-4 shadow-2xl overflow-auto transform transition-transform duration-300 ease-out rounded-l-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Menu</div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <DashboardSidebar isVendor={user?.role === 'vendor'} />
          </div>
        </div>
      )}
    </nav>
  );
}
