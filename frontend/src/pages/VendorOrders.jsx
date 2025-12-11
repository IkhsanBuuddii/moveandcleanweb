import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { API, getVendors, getOrdersByVendor, updateOrderStatus } from '../utils/api'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Toast, { useToast } from '../components/ui/Toast'

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
  const [openOrder, setOpenOrder] = useState(null)
  const [statusToSet, setStatusToSet] = useState(null)
  const { toasts, push, remove } = useToast()

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
          // Use polling-only to avoid WebSocket upgrade overhead and limit resource usage
          const socket = io(socketUrl, {
            path: '/socket.io',
            transports: ['polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          })
          socketRef.current = socket

          socket.on('connect', () => {
            socket.emit('join_vendor', my.id)
          })

          socket.on('connect_error', (err) => {
            console.warn('Socket connect_error', err)
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
    try {
      setLoading(true)
      const updated = await updateOrderStatus(orderId, status)
      const u = normalizeOrder(updated)
      setOrders((prev) => prev.map((o) => (o.id === u.id ? u : o)))
      push(`Status diubah ke '${status}'`, 'success')
      setStatusToSet(null)
    } catch (err) {
      push(err?.message || 'Gagal mengubah status', 'error')
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
                  <div className="mt-3">
                    <button className="px-3 py-1 border rounded text-sm" onClick={() => setOpenOrder(o)}>Lihat Detail</button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium mb-2">Status: <span className="text-slate-700">{o.status}</span></div>
                  <div className="flex flex-col gap-2">
                    <button disabled={loading} onClick={() => setStatusToSet({ id: o.id, status: 'accepted' })} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Terima</button>
                    <button disabled={loading} onClick={() => setStatusToSet({ id: o.id, status: 'in_progress' })} className="px-3 py-1 bg-amber-500 text-white rounded text-sm">Mulai</button>
                    <button disabled={loading} onClick={() => setStatusToSet({ id: o.id, status: 'completed' })} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Selesai</button>
                    <button disabled={loading} onClick={() => setStatusToSet({ id: o.id, status: 'cancelled' })} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Batalkan</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!openOrder} onClose={() => setOpenOrder(null)} title={openOrder ? `Order #${openOrder.id}` : ''}
        actions={openOrder && (
          <>
            <button className="px-3 py-2 rounded border" onClick={() => setOpenOrder(null)}>Tutup</button>
          </>
        )}>
        {openOrder && (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Layanan:</span> {openOrder.title || openOrder.service_title}</div>
            <div><span className="font-medium">Pelanggan:</span> {openOrder.user_name || openOrder.name || openOrder.email}</div>
            <div><span className="font-medium">Tanggal:</span> {openOrder.date}</div>
            <div><span className="font-medium">Total:</span> Rp{openOrder.total?.toLocaleString?.() || openOrder.total}</div>
            <div><span className="font-medium">Catatan:</span> {openOrder.notes || '-'}</div>
            <div><span className="font-medium">Status:</span> {openOrder.status}</div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!statusToSet}
        title="Ubah Status Pesanan"
        message={statusToSet ? `Apakah Anda yakin ingin mengubah status menjadi '${statusToSet.status}'?` : ''}
        onCancel={() => setStatusToSet(null)}
        onConfirm={() => { const s = statusToSet; setStatusToSet(null); changeStatus(s.id, s.status) }}
      />

      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
