import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="px-6 py-12 bg-slate-50 min-h-[80vh] flex flex-col justify-center">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Move & Clean — Mudah, Cepat, Terpercaya
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            Layanan kebersihan profesional untuk rumah, kantor, dan ruang bisnis Anda.
          </p>
          <div className="mt-6 flex gap-4">
            <Link to="/services" className="px-5 py-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition">
              Lihat Layanan
            </Link>
            <Link to="/auth" className="px-5 py-3 rounded-lg border hover:bg-slate-100 transition">
              Pesan Sekarang
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md h-64 bg-gradient-to-tr from-sky-100 to-sky-50 rounded-2xl flex items-center justify-center text-slate-400 text-lg font-medium">
            Gambar Promo / Mockup
          </div>
        </div>
      </div>
    </section>
  )
}
