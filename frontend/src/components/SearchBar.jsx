import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef()
  const containerRef = useRef()
  const nav = useNavigate()

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function submitSearch(e) {
    e.preventDefault()
    const query = (q || '').trim()
    nav(`/dashboard/service${query ? `?q=${encodeURIComponent(query)}` : ''}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-slate-600 hover:text-sky-600"
          aria-label="Open search"
        >
          <Search size={18} />
        </button>
      ) : (
        <form onSubmit={submitSearch} className="flex items-center bg-white border rounded-md shadow-sm overflow-hidden">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari layanan..."
            className="px-3 py-2 w-56 text-sm outline-none"
            aria-label="Search services"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="px-2 text-slate-500">
              <X size={16} />
            </button>
          )}
          <button type="submit" className="px-3 bg-sky-600 text-white text-sm">
            Cari
          </button>
        </form>
      )}
    </div>
  )
}
