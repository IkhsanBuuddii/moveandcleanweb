import React, { useState } from 'react'
import { createOrder } from '../utils/api'

export default function BookingModal({ service, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!user) return setError('Silakan login terlebih dahulu')
    setLoading(true)
    try {
      const payload = {
        user_id: user.id,
        vendor_id: service.vendor_id || service.vendorId || service.vendorId || 1,
        service_id: service.id,
        total: service.price || 0,
      }

      await createOrder(payload)
      setLoading(false)
      if (onSuccess) onSuccess()
      onClose()
      alert('Pesanan berhasil dibuat')
    } catch (err) {
      setLoading(false)
      setError(err?.message || 'Gagal membuat pesanan')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-lg p-6 z-10">
        <h3 className="text-lg font-semibold">Pesan: {service.title}</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Catatan (opsional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-sky-600 text-white">
              {loading ? 'Memproses...' : `Konfirmasi — Rp${(service.price || 0).toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
