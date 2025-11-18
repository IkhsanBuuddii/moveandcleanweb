import React, { useEffect, useState } from 'react'
import { getOrdersByUser, getServices } from '../utils/api'

export default function History() {
  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null') || { id: 1 }
  const [orders, setOrders] = useState([])
  const [servicesMap, setServicesMap] = useState({})

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [ordersRes, services] = await Promise.all([
          getOrdersByUser(user.id),
          getServices(),
        ])

        if (!mounted) return

        const map = {}
        services.forEach((s) => (map[s.id] = s))
        setServicesMap(map)

        // backend returns orders array; if static fallback, it may be filtered already
        const userOrders = Array.isArray(ordersRes)
          ? ordersRes
          : []
        setOrders(userOrders)
      } catch (err) {
        console.error('Failed loading history', err)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [user.id])

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800">Riwayat Pesanan</h2>
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-slate-600">Belum ada riwayat pesanan.</div>
        )}
        {orders.map((o) => (
          <div key={o.id} className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm">
            <div>
              <div className="font-medium text-slate-800">{servicesMap[o.service_id || o.serviceId]?.title || servicesMap[o.service_id || o.serviceId]?.title || 'Layanan'}</div>
              <div className="text-sm text-slate-600">{o.date} — {o.status}</div>
            </div>
            <div className="text-sm text-slate-700">#{o.id}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
