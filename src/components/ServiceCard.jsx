import React from 'react'

export default function ServiceCard({ s }) {
  return (
    <div className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white">
      <h3 className="font-semibold text-lg text-sky-600">{s.title}</h3>
      <p className="text-sm text-slate-600 mt-2">{s.description}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
        <span>{s.duration} • Rp{s.price.toLocaleString()}</span>
        <button className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700">
          Pesan
        </button>
      </div>
    </div>
  )
}
