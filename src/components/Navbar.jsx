import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, UserCircle } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const nav = useNavigate();
  const dropdownRef = useRef();

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

  // Tutup dropdown kalau klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-sky-600 tracking-tight">
          MoveandClean
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-6 text-slate-700">
          <Link to="/services" className="hover:text-sky-600 transition">
            Layanan
          </Link>
          <Link to="/history" className="hover:text-sky-600 transition">
            Riwayat
          </Link>
          <Link to="/dashboard" className="hover:text-sky-600 transition">
            Dashboard
          </Link>

          {user ? (
            // Jika user login
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:text-sky-600"
              >
                <UserCircle className="w-7 h-7 text-sky-600" />
                <span className="text-sm font-medium">{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md w-44 py-2 z-50 animate-fadeIn">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-sky-50 text-slate-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Jika belum login
            <Link
              to="/auth"
              className="px-3 py-1 border rounded-md hover:bg-sky-50"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Tombol Menu Mobile */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-sky-600"
          onClick={() => setOpen(!open)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden border-t bg-white px-6 py-3 space-y-3 text-slate-700">
          <Link to="/services" className="block hover:text-sky-600">
            Layanan
          </Link>
          <Link to="/history" className="block hover:text-sky-600">
            Riwayat
          </Link>
          <Link to="/dashboard" className="block hover:text-sky-600">
            Dashboard
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="block hover:text-sky-600">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="block text-left text-red-600 hover:text-red-700"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link to="/auth" className="block hover:text-sky-600">
              Masuk
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
