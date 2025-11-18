import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
export default function Dashboard() {
  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')
  const isVendor = user?.role === 'vendor'

  

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <main className="px-6 py-10 flex-1 container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Selamat Datang, {user?.name || 'Pengguna'} 👋</h2>
          <div className="text-sm text-slate-500">{isVendor ? 'Mode Vendor' : 'Mode Pengguna'}</div>
        </div>

        <div>
          <div>
            {/* main content follows */}

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {!isVendor ? (
                <> 
                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-slate-800 text-lg">Promo Spesial</h3>
                    <p className="text-sm text-slate-600 mt-2">Diskon 20% untuk layanan pembersihan rumah minggu ini.</p>
                    <Link to="/dashboard/service" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Detail</Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-slate-800 text-lg">Pesanan Terbaru</h3>
                    <p className="text-sm text-slate-600 mt-2">Cek status pesanan terakhir Anda di menu riwayat.</p>
                    <Link to="/dashboard/history" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Riwayat</Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-slate-800 text-lg">Layanan Populer</h3>
                    <p className="text-sm text-slate-600 mt-2">Jelajahi layanan yang paling banyak dipesan pengguna lain.</p>
                    <Link to="/dashboard/service" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Semua</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-slate-800 text-lg">Pesanan Masuk</h3>
                    <p className="text-sm text-slate-600 mt-2">Lihat dan kelola pesanan masuk Anda.</p>
                    <Link to="/dashboard/vendor/orders" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Kelola Pesanan</Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-slate-800 text-lg">Kelola Layanan</h3>
                    <p className="text-sm text-slate-600 mt-2">Tambahkan atau sunting layanan yang Anda tawarkan.</p>
                    <Link to="/dashboard/vendor/services" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Kelola Layanan</Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-slate-800 text-lg">Laporan & Pendapatan</h3>
                    <p className="text-sm text-slate-600 mt-2">Ringkasan pendapatan dan laporan performa layanan.</p>
                    <Link to="/dashboard/vendor/reports" className="text-sky-600 text-sm mt-3 inline-block hover:underline">Lihat Laporan</Link>
                  </div>
                </>
              )}
            </div>

            {/* Features and quick-priorities removed per user request */}
          </div>
        </div>
      </main>

      {/* Footer is rendered globally in App.jsx - avoid duplicate here */}
    </div>
  )
}
