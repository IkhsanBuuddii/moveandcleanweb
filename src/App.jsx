import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import History from './pages/History';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute'; 

export default function App() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/auth'

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthRoute && <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              JSON.parse(sessionStorage.getItem('mc_user') || 'null') ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Home />
              )
            }
          />
          <Route path="/auth" element={<Auth />} />

          {/* 🔒 Hanya bisa diakses kalau sudah login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/service"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Vendor pages (placeholders until real pages exist) */}
          <Route
            path="/dashboard/vendor/orders"
            element={
              <ProtectedRoute>
                <div>Vendor Orders - Coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vendor/services"
            element={
              <ProtectedRoute>
                <div>Vendor Services - Coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vendor/reports"
            element={
              <ProtectedRoute>
                <div>Vendor Reports - Coming soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vendor/settings"
            element={
              <ProtectedRoute>
                <div>Vendor Settings - Coming soon</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}
