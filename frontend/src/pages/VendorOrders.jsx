import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { API, getVendors, getOrdersByVendor, updateOrderStatus } from '../utils/api'

function normalizeOrder(o) {
  return {
    ...o,
    service_title: o.title || (o.services && o.services.title) || o['services.title'] || o.service_title,
    user_name: o.user_name || (o.users && o.users.name) || o.name || o.email,
  }
}

export default function VendorOrders() {
  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')
  const [vendor, setVendor] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const all = await getVendors()
        const my = all.find((v) => v.user_id === user?.id)
        setVendor(my)
        if (my) {
          const ord = await getOrdersByVendor(my.id) || []
          const mapped = ord.map((o) => normalizeOrder(o))
          setOrders(mapped)

          // initialize socket and join vendor room
          // use API base if configured, otherwise same origin
          const socketUrl = (API && API.length) ? API : window.location.origin
          const socket = io(socketUrl, { transports: ['websocket', 'polling'] })
          socketRef.current = socket

          socket.on('connect', () => {
            socket.emit('join_vendor', my.id)
          })

          socket.on('new_order', (newOrder) => {
            const n = normalizeOrder(newOrder)
            setOrders((prev) => [n, ...prev])
          })

          socket.on('order_updated', (updated) => {
            const u = normalizeOrder(updated)
            setOrders((prev) => prev.map((o) => (o.id === u.id ? u : o)))
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()

    return () => {
      // cleanup socket on unmount
      if (socketRef.current) {
        socketRef.current.off('new_order')
        socketRef.current.off('order_updated')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user])

  async function changeStatus(orderId, status) {
    if (!confirm(`Ubah status pesanan menjadi '${status}'?`)) return
    try {
      setLoading(true)
      const updated = await updateOrderStatus(orderId, status)
      const u = normalizeOrder(updated)
      setOrders((prev) => prev.map((o) => (o.id === u.id ? u : o)))
    } catch (err) {
      alert(err?.message || 'Gagal mengubah status')
    } finally { setLoading(false) }
  }

  if (!vendor) return <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">Anda belum terdaftar sebagai vendor.</div>

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Pesanan Masuk — {vendor.vendor_name}</h2>

      {orders.length === 0 ? (
        <div className="text-sm text-slate-500">Belum ada pesanan untuk saat ini.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="p-3 border rounded">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">Order #{o.id} — {o.title || o.service_title}</div>
                  <div className="text-xs text-slate-500">Pelanggan: {o.user_name || o.name || o.email} • {o.date}</div>
                  <div className="mt-2 text-sm">Total: Rp{o.total?.toLocaleString?.() || o.total}</div>
                  <div className="mt-2 text-sm text-slate-600">Notes: {o.notes || '-'}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium mb-2">Status: <span className="text-slate-700">{o.status}</span></div>
                  <div className="flex flex-col gap-2">
                    <button disabled={loading} onClick={() => changeStatus(o.id, 'accepted')} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Terima</button>
                    <button disabled={loading} onClick={() => changeStatus(o.id, 'in_progress')} className="px-3 py-1 bg-amber-500 text-white rounded text-sm">Mulai</button>
                    <button disabled={loading} onClick={() => changeStatus(o.id, 'completed')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Selesai</button>
                    <button disabled={loading} onClick={() => changeStatus(o.id, 'cancelled')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Batalkan</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
