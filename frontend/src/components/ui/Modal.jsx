import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, actions }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[92%] max-w-lg">
        {title && <div className="px-4 py-3 border-b text-slate-800 font-semibold">{title}</div>}
        <div className="p-4">{children}</div>
        {actions && <div className="px-4 py-3 border-t bg-slate-50 flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  )
}
