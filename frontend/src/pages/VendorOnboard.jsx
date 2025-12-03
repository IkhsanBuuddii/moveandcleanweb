import React, { useState } from 'react'
import { createVendor } from '../utils/api'

export default function VendorOnboard() {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loc, setLoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!user) return setError('Silakan login terlebih dahulu')
    setLoading(true)
    try {
      const res = await createVendor({ user_id: user.id, vendor_name: name, description: desc, location: loc })
      // server returns { vendor, user } on success (user contains updated role). Use it to update session.
      const updatedUser = (res && res.user) ? res.user : { ...user, role: 'vendor' }
      sessionStorage.setItem('mc_user', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('mc_auth_change'))
      setLoading(false)
      window.location.href = '/dashboard/vendor/services'
    } catch (err) {
      setLoading(false)
      setError(err?.message || 'Gagal membuat vendor')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-3">Daftar sebagai Vendor</h2>
      <p className="text-sm text-slate-500 mb-4">Isi data usaha Anda agar bisa mulai menerima pesanan.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Usaha" className="w-full border px-3 py-2 rounded" required />
        <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Lokasi" className="w-full border px-3 py-2 rounded" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi singkat" className="w-full border px-3 py-2 rounded" rows={4} />
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded">{loading ? 'Memproses...' : 'Daftar sebagai Vendor'}</button>
        </div>
      </form>
    </div>
  )
}
