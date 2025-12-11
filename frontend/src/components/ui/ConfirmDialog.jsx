import React from 'react'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-[92%] max-w-sm">
        {title && <div className="px-4 py-3 border-b text-slate-800 font-semibold">{title}</div>}
        <div className="p-4 text-slate-700">{message}</div>
        <div className="px-4 py-3 border-t bg-slate-50 flex justify-end gap-2">
          <button className="px-3 py-2 rounded border" onClick={onCancel}>Batal</button>
          <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  )
}
