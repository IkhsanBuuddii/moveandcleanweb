import React, { useEffect, useState } from 'react'
import { getServices } from '../utils/api'
import ServiceCard from '../components/ServiceCard'

export default function Services() {
  const [services, setServices] = useState([])

  useEffect(() => {
    getServices().then(setServices).catch(console.error)
  }, [])

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800">Daftar Layanan</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {services.map(s => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  )
}
