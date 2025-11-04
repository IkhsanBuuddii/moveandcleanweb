import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-sky-600 tracking-tight">
          MoveandClean
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-slate-700">
          <Link to="/services" className="hover:text-sky-600 transition">Layanan</Link>
          <Link to="/history" className="hover:text-sky-600 transition">Riwayat</Link>
          <Link to="/dashboard" className="hover:text-sky-600 transition">Dashboard</Link>
          <Link to="/auth" className="px-3 py-1 border rounded-md hover:bg-sky-50">Masuk</Link>
        </div>
        <button className="md:hidden p-2 text-slate-600 hover:text-sky-600">
          <Menu size={22}/>
        </button>
      </div>
    </nav>
  )
}
