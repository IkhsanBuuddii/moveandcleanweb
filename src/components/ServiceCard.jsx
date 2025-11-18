import React, { useState } from 'react'
import BookingModal from './BookingModal'

export default function ServiceCard({ s }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border hover:shadow-md transition">
      <div className="h-36 bg-slate-100 flex items-center justify-center text-slate-400">
        <div className="text-sm">Gambar Layanan</div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{s.title}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sky-600 font-semibold">Rp{s.price?.toLocaleString()}</div>
            <div className="text-xs text-slate-400">{s.duration}</div>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={() => setOpen(true)} className="w-full py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 transition">
            Pesan Sekarang
          </button>
        </div>
      </div>

      {open && (
        <BookingModal
          service={s}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            // optional: could dispatch event to refresh orders/history
            window.dispatchEvent(new Event('mc_order_created'))
          }}
        />
      )}
    </div>
  )
}
