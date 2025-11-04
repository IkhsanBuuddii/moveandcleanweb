import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("mc_user"));
    if (storedUser) {
      setUser(storedUser);
      setIsVendor(storedUser.role === "vendor");
    }
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("mc_user");
    navigate("/auth");
  }

  function toggleVendorMode() {
    setIsVendor(!isVendor);
    // nanti bisa dihubungkan ke backend untuk ubah role user
  }

  if (!user) return <p className="text-center text-slate-500">Memuat data...</p>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 space-y-6">
      {/* Foto Profil */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center text-4xl font-semibold text-sky-600">
          {user.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <h2 className="mt-3 text-lg font-semibold text-slate-800">
          {isVendor ? user.businessName || user.name : user.name}
        </h2>
        <p className="text-slate-500 text-sm">{user.email}</p>
      </div>

      {/* Menu Opsi */}
      <div className="divide-y divide-slate-200">
        <button
          className="w-full text-left py-3 hover:bg-slate-50"
          onClick={() => alert("Fitur Edit Profile coming soon")}
        >
          ✏️ Edit Profil
        </button>
        {!isVendor && (
          <>
            <button
              className="w-full text-left py-3 hover:bg-slate-50"
              onClick={() => alert("Notifikasi coming soon")}
            >
              🔔 Notifikasi
            </button>
            <button
              className="w-full text-left py-3 hover:bg-slate-50"
              onClick={() => alert("Metode Pembayaran coming soon")}
            >
              💳 Metode Pembayaran
            </button>
          </>
        )}
        <button
          className="w-full text-left py-3 hover:bg-slate-50"
          onClick={() => alert("Bantuan dan Dukungan coming soon")}
        >
          🆘 Bantuan & Dukungan
        </button>
        <button
          onClick={toggleVendorMode}
          className="w-full text-left py-3 hover:bg-slate-50 text-sky-600"
        >
          {isVendor ? "Ubah ke Mode Pengguna" : "Ubah ke Mode Vendor"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left py-3 hover:bg-red-50 text-red-600"
        >
          🚪 Keluar
        </button>
      </div>
    </div>
  );
}
