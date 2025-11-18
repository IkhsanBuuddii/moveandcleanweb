import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Box,
  Clock,
  User,
  CreditCard,
  Bell,
  Settings,
  Users,
  BarChart,
  DollarSign,
  LogOut,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

export default function DashboardSidebar({ isVendor }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [vendorOpen, setVendorOpen] = useState(true)

  const linkClass = (path, extra = '') =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${location.pathname === path ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-sky-50'} ${extra}`

  function handleLogout() {
    sessionStorage.removeItem('mc_user')
    window.dispatchEvent(new Event('mc_auth_change'))
    navigate('/')
  }

  return (
    <aside className="w-full lg:w-72 bg-gradient-to-b from-white to-slate-50 border rounded-xl p-3 shadow-xl">
      <div className="mb-3 px-1">
        <div className="text-sm font-semibold text-slate-800">Navigation</div>
        <div className="text-xs text-slate-500">Quick access to important areas</div>
      </div>

      <nav className="space-y-2 text-sm">
        <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-sky-50'}`} end>
          <Home className="w-4 h-4" />
          <span>Overview</span>
        </NavLink>

        <div className="mt-2 text-xs text-slate-500 px-3">Pengguna</div>
        <NavLink to="/dashboard/service" className={() => linkClass('/dashboard/service')}>
          <Box className="w-4 h-4" />
          <span>Layanan</span>
        </NavLink>

        <NavLink to="/dashboard/bookings" className={() => linkClass('/dashboard/bookings')}>
          <Clock className="w-4 h-4" />
          <span>Pesanan Saya</span>
        </NavLink>

        <NavLink to="/dashboard/history" className={() => linkClass('/dashboard/history')}>
          <ShoppingCart className="w-4 h-4" />
          <span>Riwayat Pesanan</span>
        </NavLink>

        <NavLink to="/dashboard/payments" className={() => linkClass('/dashboard/payments')}>
          <CreditCard className="w-4 h-4" />
          <span>Pembayaran</span>
        </NavLink>

        <NavLink to="/dashboard/profile" className={() => linkClass('/dashboard/profile')}>
          <User className="w-4 h-4" />
          <span>Profil & Pengaturan</span>
        </NavLink>

        <NavLink to="/dashboard/notifications" className={() => linkClass('/dashboard/notifications')}>
          <Bell className="w-4 h-4" />
          <span>Notifikasi</span>
        </NavLink>

        {isVendor && (
          <div className="mt-3">
            <button onClick={() => setVendorOpen((v) => !v)} className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-sky-50">
              <div className="flex items-center gap-3"><Users className="w-4 h-4" /><span>Vendor Tools</span></div>
              <div className="text-slate-500">{vendorOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</div>
            </button>

            {vendorOpen && (
              <div className="mt-2 space-y-1">
                <NavLink to="/dashboard/vendor/orders" className={() => linkClass('/dashboard/vendor/orders', 'pl-8')}>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Pesanan Masuk</span>
                </NavLink>

                <NavLink to="/dashboard/vendor/services" className={() => linkClass('/dashboard/vendor/services', 'pl-8')}>
                  <Box className="w-4 h-4" />
                  <span>Kelola Layanan</span>
                </NavLink>

                <NavLink to="/dashboard/vendor/schedule" className={() => linkClass('/dashboard/vendor/schedule', 'pl-8')}>
                  <Clock className="w-4 h-4" />
                  <span>Jadwal & Ketersediaan</span>
                </NavLink>

                <NavLink to="/dashboard/vendor/workers" className={() => linkClass('/dashboard/vendor/workers', 'pl-8')}>
                  <Users className="w-4 h-4" />
                  <span>Tim / Pekerja</span>
                </NavLink>

                <NavLink to="/dashboard/vendor/reports" className={() => linkClass('/dashboard/vendor/reports', 'pl-8')}>
                  <BarChart className="w-4 h-4" />
                  <span>Laporan & Pendapatan</span>
                </NavLink>

                <NavLink to="/dashboard/vendor/payouts" className={() => linkClass('/dashboard/vendor/payouts', 'pl-8')}>
                  <DollarSign className="w-4 h-4" />
                  <span>Payouts</span>
                </NavLink>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 border-t pt-3">
          <div className="text-xs text-slate-500 px-3">Bantuan</div>
          <NavLink to="/dashboard/support" className={() => linkClass('/dashboard/support')}>
            <Settings className="w-4 h-4" />
            <span>Hubungi Support</span>
          </NavLink>
          <NavLink to="/dashboard/faq" className={() => linkClass('/dashboard/faq')}>
            <BarChart className="w-4 h-4" />
            <span>FAQ</span>
          </NavLink>
        </div>

        <div className="mt-4 border-t pt-3 px-3">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4" /> Keluar</button>
        </div>
      </nav>
    </aside>
  )
}
