import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getServices } from '../utils/api'
import ServiceCard from '../components/ServiceCard'

export default function Home() {
  const [services, setServices] = useState([])

  useEffect(() => {
    getServices()
      .then((s) => setServices(s.slice(0, 6)))
      .catch(() => setServices([]))
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Jasa Pindahan dan Bersih-bersih
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Solusi pindahan dan kebersihan yang cepat, andal, dan terjangkau — kami bantu
              dari pengepakan sampai bersih-bersih pasca pindahan.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/dashboard/service"
                className="inline-block px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
              >
                Pesan Sekarang
              </Link>
              <Link
                to="/auth"
                className="inline-block px-6 py-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                Lihat Paket
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-xl h-72 md:h-96 rounded-3xl shadow-lg overflow-hidden bg-white flex items-center justify-center">
              <div className="w-full h-full bg-[linear-gradient(135deg,#e6f6ff_0%,#f8fbff_50%)] flex items-center justify-center">
                <div className="text-center text-slate-400">Hero image / promo illustration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami (categories) */}
      <section id="services" className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Layanan Kami</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className="h-32 rounded-lg bg-slate-100 flex items-center justify-center">Pindahan</div>
            <h3 className="mt-4 font-semibold text-slate-800">Pindahan</h3>
            <p className="text-sm text-slate-500 mt-2">Paket pindahan untuk segala ukuran rumah</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className="h-32 rounded-lg bg-slate-100 flex items-center justify-center">Cleaning</div>
            <h3 className="mt-4 font-semibold text-slate-800">Bersih-bersih</h3>
            <p className="text-sm text-slate-500 mt-2">Deep clean, quick clean, dan layanan pasca-pindah</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className="h-32 rounded-lg bg-slate-100 flex items-center justify-center">Angkut</div>
            <h3 className="mt-4 font-semibold text-slate-800">Angkut Barang</h3>
            <p className="text-sm text-slate-500 mt-2">Jasa angkut untuk barang besar dan khusus</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <div className="h-32 rounded-lg bg-slate-100 flex items-center justify-center">Kombinasi</div>
            <h3 className="mt-4 font-semibold text-slate-800">Pindahan + Cleaning</h3>
            <p className="text-sm text-slate-500 mt-2">Paket lengkap supaya Anda tinggal tenang</p>
          </div>
        </div>
      </section>
      {/* Available services grid (moved under Layanan Kami) */}
      <section className="container mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Layanan Tersedia</h2>
          <Link to="/dashboard/service" className="text-sm text-sky-600 hover:underline">Lihat Semua</Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* About section: horizontal cards (no emojis) */}
      <section id="about" className="container mx-auto px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Tentang Move &amp; Clean</h2>
          <p className="text-slate-600 mb-6">Move &amp; Clean menyediakan layanan pindahan dan pembersihan lengkap untuk rumah dan kantor. Kami menggabungkan tim berpengalaman, peralatan profesional, dan standar keselamatan untuk memastikan proses yang cepat dan aman.</p>

          <div className="flex gap-4 overflow-x-auto py-4">
            <div className="min-w-[240px] bg-white rounded-lg p-5 shadow-sm border">
              <div className="font-semibold">Jenis Layanan</div>
              <div className="text-sm text-slate-500 mt-2">Cleaning, Moving, Pindahan + Cleaning</div>
            </div>

            <div className="min-w-[240px] bg-white rounded-lg p-5 shadow-sm border">
              <div className="font-semibold">Kisaran Harga</div>
              <div className="text-sm text-slate-500 mt-2">Rp50.000 — Rp1.000.000 (tergantung layanan)</div>
            </div>

            <div className="min-w-[240px] bg-white rounded-lg p-5 shadow-sm border">
              <div className="font-semibold">Estimasi Durasi</div>
              <div className="text-sm text-slate-500 mt-2">2 — 8 jam, sesuai jenis layanan</div>
            </div>

            <div className="min-w-[240px] bg-white rounded-lg p-5 shadow-sm border">
              <div className="font-semibold">Jumlah Pekerja</div>
              <div className="text-sm text-slate-500 mt-2">2 — 6 orang per pesanan (opsional)</div>
            </div>

            <div className="min-w-[260px] bg-white rounded-lg p-5 shadow-sm border">
              <div className="font-semibold">Keamanan &amp; Jaminan</div>
              <div className="text-sm text-slate-500 mt-2">Tim kami menjalani pelatihan dan pemeriksaan; kami menyediakan tanggung jawab dasar untuk beberapa layanan.</div>
            </div>
          </div>

          {/* Ringkasan Cepat removed per request */}
        </div>
      </section>

      {/* Reviews separated below About */}
      <section id="reviews" className="container mx-auto px-6 py-10">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">Ulasan Pelanggan</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="font-medium">Budi</div>
            <div className="text-sm text-slate-500 mt-1">Cepat dan rapi — pindahan lancar tanpa masalah.</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="font-medium">Siti</div>
            <div className="text-sm text-slate-500 mt-1">Tim sangat profesional, bersih dan tepat waktu.</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="font-medium">Andi</div>
            <div className="text-sm text-slate-500 mt-1">Harga terjangkau dan layanan memuaskan.</div>
          </div>
        </div>
      </section>

      

      {/* Contact / Team */}
      <section id="contact" className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Tim Move &amp; Clean</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-xl">AA</div>
            <div className="mt-3 font-semibold">Aldi</div>
            <div className="text-sm text-slate-500">CEO</div>
            <div className="text-sm text-slate-500 mt-2">aldi@moveandclean.id</div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-xl">RS</div>
            <div className="mt-3 font-semibold">Rina</div>
            <div className="text-sm text-slate-500">Operations</div>
            <div className="text-sm text-slate-500 mt-2">rina@moveandclean.id</div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-xl">HT</div>
            <div className="mt-3 font-semibold">Heru</div>
            <div className="text-sm text-slate-500">Customer Care</div>
            <div className="text-sm text-slate-500 mt-2">cs@moveandclean.id</div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-xl">MN</div>
            <div className="mt-3 font-semibold">Mira</div>
            <div className="text-sm text-slate-500">Logistik</div>
            <div className="text-sm text-slate-500 mt-2">mira@moveandclean.id</div>
          </div>
        </div>
      </section>
    </div>
  )
}
