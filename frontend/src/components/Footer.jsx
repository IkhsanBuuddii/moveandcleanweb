import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 text-slate-700">
      <div className="container mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* Branding & address */}
        <div>
          <div className="text-xl font-bold text-sky-600">Move &amp; Clean</div>
          <p className="text-sm text-slate-500 mt-2">Layanan pindahan dan kebersihan profesional.</p>
          <div className="mt-4 text-sm text-slate-600">
            <div>DAFTARKAN JASA ANDA DAN BERGABUNG MENJADI MITRA KAMI!</div>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li><a href="#services" className="hover:text-sky-600">Home / Layanan</a></li>
            <li><a href="#about" className="hover:text-sky-600">About</a></li>
            <li><a href="#contact" className="hover:text-sky-600">Contact</a></li>
            <li><a href="/auth" className="hover:text-sky-600">Login</a></li>
          </ul>
        </div>

        {/* Help section (FAQ + support info) */}
        <div>
          <h4 className="font-semibold mb-2">Butuh Bantuan?</h4>
          <p className="text-sm text-slate-500 mb-3">Cari jawaban cepat atau hubungi tim support kami.</p>
          <div className="text-sm text-slate-600 space-y-3">
            <div>
              <div className="font-medium">Pusat Bantuan (FAQ)</div>
              <ul className="mt-2 space-y-1">
                <li><a href="#" className="hover:text-sky-600">Cara memesan layanan</a></li>
                <li><a href="#" className="hover:text-sky-600">Kebijakan pembatalan</a></li>
                <li><a href="#" className="hover:text-sky-600">Metode pembayaran</a></li>
              </ul>
            </div>

            <div>
              <div className="font-medium">Support</div>
              <div className="mt-2">Jam kerja: Senin–Jumat, 08:00–17:00</div>
              <div className="mt-1">Email: <a href="mailto:support@moveandclean.id" className="text-sky-600">support@moveandclean.id</a></div>
              <div className="mt-1">Tel: <a href="tel:+6281234567890" className="text-sky-600">+62 812-3456-7890</a></div>
            </div>

            <div>
              <a href="#contact" className="inline-block mt-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm">Hubungi Support</a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t mt-6 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Move &amp; Clean — All rights reserved
      </div>
    </footer>
  )
}
