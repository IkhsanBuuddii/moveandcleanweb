import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById, getMessages, postMessage } from '../utils/api'
import { io } from 'socket.io-client'
import Modal from '../components/ui/Modal'
import Toast, { useToast } from '../components/ui/Toast'

const SOCKET_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const socketRef = useRef(null)
  const listRef = useRef(null)
  const user = JSON.parse(sessionStorage.getItem('mc_user') || 'null')
  const [openChat, setOpenChat] = useState(false)
  const { toasts, push, remove } = useToast()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const o = await getOrderById(id)
        if (mounted) setOrder(o)
        const msgs = await getMessages(id)
        if (mounted) setMessages(msgs || [])
      } catch (err) {
        console.error(err)
      }
    }
    load()

    // connect socket
    const socket = io(SOCKET_URL, { path: '/socket.io', transports: ['polling'], reconnectionAttempts: 5, reconnectionDelay: 1000 })
    socketRef.current = socket
    socket.on('connect', () => {
      socket.emit('join_order', id)
    })

    socket.on('order_message', (msg) => {
      setMessages((m) => [...m, msg])
      // auto-scroll to bottom
      setTimeout(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight }, 0)
    })

    return () => {
      mounted = false
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [id])

  async function handleSend() {
    if (!text.trim()) return
    try {
      // optimistic add
      const optimistic = { id: `temp-${Date.now()}`, sender_id: user.id, sender_name: user.name || 'Anda', text, created_at: new Date().toISOString() }
      setMessages((m) => [...m, optimistic])
      setTimeout(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight }, 0)
      const saved = await postMessage(id, { sender_id: user.id, text })
      setText('')
      // server will emit order_message and add it to list via socket
      push('Pesan terkirim', 'success')
    } catch (err) {
      console.error(err)
      push('Gagal mengirim pesan', 'error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold">Detail Pesanan</h2>
      {!order ? (
        <p className="text-sm text-slate-500 mt-4">Memuat pesanan...</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="bg-slate-50 p-3 rounded">
            <div className="font-medium">{order.title} — Rp{order.total?.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Vendor: {order.vendor_name}</div>
            <div className="text-xs text-slate-500">Status: {order.status}</div>
            <div className="text-xs text-slate-500">Jadwal: {order.scheduled_at || '—'}</div>
            <div className="mt-2">
              <button className="px-3 py-1 border rounded text-sm" onClick={() => setOpenChat(true)}>Buka Chat</button>
            </div>
          </div>

          <div className="border rounded p-3">
            <div className="mb-2 font-semibold">Chat dengan Vendor</div>
            <div ref={listRef} className="max-h-64 overflow-auto space-y-2 mb-3">
              {messages.map((m) => (
                <div key={m.id} className={`p-2 rounded ${m.sender_id === user?.id ? 'bg-sky-50 self-end' : 'bg-slate-100'}`}>
                  <div className="text-xs text-slate-600">{m.sender_name || 'Pengguna'}</div>
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.created_at}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Ketik pesan..." />
              <button onClick={handleSend} className="px-4 py-2 bg-sky-600 text-white rounded">Kirim</button>
            </div>
          </div>
        </div>
      )}
      <Modal open={openChat} onClose={() => setOpenChat(false)} title="Chat dengan Vendor"
        actions={(
          <>
            <button className="px-3 py-2 rounded border" onClick={() => setOpenChat(false)}>Tutup</button>
          </>
        )}>
        <div className="space-y-3">
          <div ref={listRef} className="max-h-[60vh] overflow-auto space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`p-2 rounded ${m.sender_id === user?.id ? 'bg-sky-50 self-end' : 'bg-slate-100'}`}>
                <div className="text-xs text-slate-600">{m.sender_name || 'Pengguna'}</div>
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-slate-400 mt-1">{m.created_at}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Ketik pesan..." />
            <button onClick={handleSend} className="px-4 py-2 bg-sky-600 text-white rounded">Kirim</button>
          </div>
        </div>
      </Modal>

      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
