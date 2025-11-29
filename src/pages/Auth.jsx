import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

export default function Auth() {
  const existing = JSON.parse(sessionStorage.getItem("mc_user") || "null");
  if (existing) return <Navigate to="/dashboard" replace />;

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
      const url = mode === 'login' ? `${API}/api/login` : `${API}/api/register`

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal");

      sessionStorage.setItem("mc_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("mc_auth_change"));
      nav("/dashboard");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  // lightweight social button placeholder
  function onSocial(provider) {
    alert(`Social login placeholder: ${provider}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Combined single card: left perks + right form */}
          <div className="bg-white/95 rounded-3xl p-1 shadow-2xl border overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch min-h-[380px]">

              {/* Left: perks + illustration (flexible) */}
              <div className="flex-1 min-w-0 md:max-w-[55%] p-6 md:p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Selamat Datang di Move & Clean</h3>
                    <p className="text-sm text-slate-500 mt-2">Cepat, andal, dan nyaman — pesan layanan kebersihan kapan saja.</p>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 font-semibold">1</div>
                        <div>
                          <div className="font-semibold text-slate-700">Pelayanan Terpercaya</div>
                          <div className="text-xs text-slate-500">Tenaga terlatih & evaluasi kualitas.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 font-semibold">2</div>
                        <div>
                          <div className="font-semibold text-slate-700">Pembayaran Aman</div>
                          <div className="text-xs text-slate-500">Beberapa metode, proses cepat.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 font-semibold">3</div>
                        <div>
                          <div className="font-semibold text-slate-700">Jadwal Fleksibel</div>
                          <div className="text-xs text-slate-500">Atur waktu sesuai kebutuhan Anda.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative illustration removed for layout stability */}
                </div>
              </div>

              {/* Right: form panel (fixed width on larger screens, flexible on small) */}
              <div className="w-full md:w-[420px] flex-none p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{mode === "login" ? "Masuk ke Akun" : "Buat Akun Baru"}</h2>
                    <p className="text-xs text-slate-500">{mode === "login" ? "Masukkan kredensial Anda untuk melanjutkan." : "Daftar dan mulai pesan layanan."}</p>
                  </div>

                  <div className="hidden sm:flex gap-2">
                    <button onClick={() => setMode('login')} className={`px-3 py-1 rounded-md text-sm ${mode==='login' ? 'bg-sky-600 text-white' : 'border text-slate-600'}`}>Login</button>
                    <button onClick={() => setMode('register')} className={`px-3 py-1 rounded-md text-sm ${mode==='register' ? 'bg-sky-600 text-white' : 'border text-slate-600'}`}>Register</button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onSocial('Google')} className="flex-1 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm">Continue with Google</button>
                    <button type="button" onClick={() => onSocial('Facebook')} className="py-2 px-3 rounded-md border bg-white hover:bg-slate-50 text-sm">f</button>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {mode === "register" && (
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Nama lengkap"
                      className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                    />
                  )}

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />

                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={onChange}
                      placeholder="Password"
                      className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500">{showPassword ? 'Hide' : 'Show'}</button>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    disabled={loading}
                    className="w-full py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-60"
                  >
                    {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Daftar')}
                  </button>
                </form>

                <div className="mt-4 text-center text-sm text-slate-500">
                  {mode === 'login' ? (
                    <>
                      Belum punya akun? <button onClick={() => setMode('register')} className="text-sky-600">Daftar</button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun? <button onClick={() => setMode('login')} className="text-sky-600">Masuk</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
