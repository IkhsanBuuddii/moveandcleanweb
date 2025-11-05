# MoveandClean — React + Tailwind + Express + SQLite MVP

This repository contains a minimal React + Tailwind scaffold for the MoveandClean MVP (UI + backend using Express and SQLite).

## 🚀 Quick Start

To get the project up and running locally, follow these steps:

1.  **Installation**

    Install all required dependencies (frontend and backend).

    ```bash
    # Install root dependencies (React, Express, better-sqlite3, etc.)
    npm install
    ```

2.  **Run Backend Server**

    Start the API server, which handles database connections and API endpoints.

    ```bash
    node src/backend/server.js
    ```

3.  **Run Development Server (Frontend)**

    Start the React development server. The application will typically be accessible at `http://localhost:5173`.

    ```bash
    npm run dev
    ```

4.  **Build for Production**

    Build the frontend assets for deployment.

    ```bash
    npm run build
    ```

---

## 💻 Project Notes

### Struktur Proyek

Proyek ini dibagi menjadi dua komponen utama dalam direktori `src/`:

* `src/frontend/`: Aplikasi **React** dan komponen UI.
* `src/backend/`: Server **Express** yang menangani API dan logika database.

### Database dan Backend

* **Database**: Menggunakan **SQLite** (`moveandclean.db`).
* **API**: Server Express menangani otentikasi, *vendor*, *service*, dan *order* API.
* **Skema Utama**: Meliputi tabel `users`, `vendors`, `services`, dan `orders`.
* **Otentikasi**: Disimulasikan menggunakan `sessionStorage` di sisi *client* (MVP).

---

## 📦 Deployment

The project requires **separate deployments** for the frontend and backend:

| Component | Target Platform (Example) | Notes |
| :--- | :--- | :--- |
| **Frontend** (React) | Vercel, Netlify | Uses `npm run build` |
| **Backend** (Express/Node) | Render, Fly.io, Railway | Requires Node environment. |
