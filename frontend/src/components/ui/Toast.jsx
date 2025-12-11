import React, { useEffect, useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  function push(msg, type = 'info') {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }
  return { toasts, push, remove: (id) => setToasts((t) => t.filter((x) => x.id !== id)) }
}

export default function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`px-3 py-2 rounded shadow text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-slate-800'}`}
             onClick={() => remove(t.id)}>
          {t.msg}
        </div>
      ))}
    </div>
  )}
