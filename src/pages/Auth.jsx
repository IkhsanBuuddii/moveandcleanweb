import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url =
        mode === "login"
          ? "http://localhost:3000/api/login"
          : "http://localhost:3000/api/register";

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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/40" />

      {/* Floating Auth Card */}
      <div className="relative z-10 max-w-sm w-full bg-white/80 rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-center text-xl font-semibold text-slate-700 mb-4">
          {mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}
        </h2>

        {/* Tombol Tab Login/Register */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md transition ${
              mode === "login"
                ? "bg-sky-600 text-white"
                : "border border-slate-300 text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md transition ${
              mode === "register"
                ? "bg-sky-600 text-white"
                : "border border-slate-300 text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Nama lengkap"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          )}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full py-2 rounded bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
