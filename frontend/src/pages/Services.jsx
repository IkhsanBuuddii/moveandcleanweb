import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getServices } from '../utils/api'
import ServiceCard from '../components/ServiceCard'
import Modal from '../components/ui/Modal'
import BookingModal from '../components/BookingModal'

export default function Services() {
  const [services, setServices] = useState([])
  const [selected, setSelected] = useState(null)
  const location = useLocation()

  useEffect(() => {
    getServices().then(setServices).catch(console.error)
  }, [])

  // read query param q for search
  const q = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('q') || '').trim().toLowerCase()
  }, [location.search])

  const filtered = useMemo(() => {
    if (!q) return services
    return services.filter((s) => {
      return (
        (s.title || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
      )
    })
  }, [services, q])

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Daftar Layanan</h2>
          {q && <div className="text-sm text-slate-500 mt-1">Hasil pencarian untuk "{q}"</div>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div key={s.id} onClick={() => setSelected(s)} className="cursor-pointer">
            <ServiceCard s={s} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-slate-500">Tidak ada layanan yang cocok.</div>
        )}
      </div>

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected.title}
          actions={(
            <>
              <button className="px-3 py-2 rounded border" onClick={() => setSelected(null)}>Tutup</button>
            </>
          )}>
          <div className="space-y-3">
            <img src={selected.image_url || '/images/placeholders/service.svg'} alt={selected.title} className="w-full h-48 object-cover rounded" />
            <div className="text-sm text-slate-700">{selected.description || 'Tidak ada deskripsi.'}</div>
            <div className="flex items-center justify-between">
              <div className="text-sky-600 font-semibold">Rp{selected.price?.toLocaleString?.() || selected.price}</div>
              <div className="text-xs text-slate-500">{selected.duration}</div>
            </div>
            <BookingModal service={selected} onClose={() => setSelected(null)} onSuccess={() => setSelected(null)} />
          </div>
        </Modal>
      )}
    </div>
  )
}
