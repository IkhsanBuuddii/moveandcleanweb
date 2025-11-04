import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
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
      if (!res.ok) throw new Error(data.error || "Gagal");

      // Backend langsung kirim data user
      const user = mode === "login" ? data : { name: form.name, email: form.email, role: form.role };
      sessionStorage.setItem("mc_user", JSON.stringify(user));

      nav("/dashboard");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow border mt-10">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}
      </h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-md ${
            mode === "login"
              ? "bg-sky-600 text-white"
              : "border border-slate-300 text-slate-600"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-2 rounded-md ${
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
          <>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Nama lengkap"
              className="w-full border px-3 py-2 rounded"
              required
            />

            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="user">Pelanggan</option>
              <option value="vendor">Vendor (Penyedia Layanan)</option>
            </select>
          </>
        )}

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end">
          <button
            disabled={loading}
            className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Daftar"}
          </button>
        </div>
      </form>
    </div>
  );
}
