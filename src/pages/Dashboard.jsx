import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')

  return (
    <div className="px-6 py-10 bg-slate-50 min-h-screen">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Selamat Datang, {user?.name || 'Pengguna'} 👋
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold text-slate-800 text-lg">Promo Spesial</h3>
          <p className="text-sm text-slate-600 mt-2">Diskon 20% untuk layanan pembersihan rumah minggu ini.</p>
          <Link to="/services" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Detail</Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold text-slate-800 text-lg">Pesanan Terbaru</h3>
          <p className="text-sm text-slate-600 mt-2">Cek status pesanan terakhir Anda di menu riwayat.</p>
          <Link to="/history" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Riwayat</Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold text-slate-800 text-lg">Layanan Populer</h3>
          <p className="text-sm text-slate-600 mt-2">Jelajahi layanan yang paling banyak dipesan pengguna lain.</p>
          <Link to="/services" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Semua</Link>
        </div>
      </div>
    </div>
  )
}
