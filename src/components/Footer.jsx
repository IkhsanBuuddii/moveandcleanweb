import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10 text-center text-sm text-slate-500 py-5">
      © {new Date().getFullYear()} MoveandClean — Built for MVP
    </footer>
  )
}
