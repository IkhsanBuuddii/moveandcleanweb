import React, { useEffect, useState } from 'react'
import { getVendors, getServicesByVendor, createService, updateService, deleteService, uploadImage } from '../utils/api'

export default function VendorServices() {
  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')
  const [vendor, setVendor] = useState(null)
  const [services, setServices] = useState([])
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const all = await getVendors()
        const my = all.find((v) => v.user_id === user?.id)
        setVendor(my)
        if (my) {
          const s = await getServicesByVendor(my.id)
          setServices(s || [])
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [user])

  async function handleAdd(e) {
    e.preventDefault()
    if (!vendor) return alert('Anda belum terdaftar sebagai vendor')
    setLoading(true)
    try {
      let image_url = undefined
      if (imageFile) {
        try {
          const r = await uploadImage(imageFile)
          console.log('uploadImage response:', r)
          image_url = r.url
        } catch (err) {
          console.error('Image upload failed', err)
          alert('Gagal upload gambar — layanan tetap akan dibuat tanpa gambar')
        }
      }

      const payload = { vendor_id: vendor.id, title, price: Number(price || 0), duration, category }
      if (image_url) payload.image_url = image_url

      const s = await createService(payload)
      console.log('createService response:', s)
      setServices((p) => [s, ...p])
      setTitle(''); setPrice(''); setDuration(''); setCategory(''); setImageFile(null)
    } catch (err) {
      alert(err?.message || 'Gagal menambah layanan')
    } finally { setLoading(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus layanan ini?')) return
    try {
      await deleteService(id)
      setServices((p) => p.filter((x) => x.id !== id))
    } catch (err) { alert(err?.message || 'Gagal menghapus') }
  }

  async function handleUpdateImage(serviceId, file) {
    if (!file) return alert('Pilih file gambar terlebih dahulu')
    try {
      const r = await uploadImage(file)
      const image_url = r?.url
      if (!image_url) throw new Error('Tidak ada URL gambar dari server')
      const updated = await updateService(serviceId, { image_url })
      // Optimistic UI: replace service in state
      setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, image_url: updated?.image_url || image_url } : s)))
    } catch (err) {
      alert(err?.message || 'Gagal memperbarui gambar')
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Kelola Layanan</h2>
      {!vendor ? (
        <div className="text-sm text-slate-500">Anda belum terdaftar sebagai vendor. Silakan daftar terlebih dahulu.</div>
      ) : (
        <>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul layanan" className="border px-3 py-2 rounded col-span-2" required />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Harga" className="border px-3 py-2 rounded" />
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Durasi" className="border px-3 py-2 rounded" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategori" className="border px-3 py-2 rounded md:col-span-4" />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="md:col-span-4" />
            <div className="md:col-span-4 flex justify-end">
              <button disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded">{loading ? 'Memproses...' : 'Tambah Layanan'}</button>
            </div>
          </form>

          <div className="mt-4 space-y-3">
            {services.map((s) => (
              <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {s.image_url ? <img src={s.image_url} alt={s.title} className="w-16 h-12 object-cover rounded" /> : (<div className="w-16 h-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">No image</div>)}
                  <div>
                    <div className="font-medium">{s.title} — Rp{s.price?.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">{s.duration} • {s.category}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0] || null
                        if (f) handleUpdateImage(s.id, f)
                      }} />
                      <span className="text-xs text-slate-500">Ganti gambar</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(s.id)} className="px-3 py-1 rounded border text-red-600">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
