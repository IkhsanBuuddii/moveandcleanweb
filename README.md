# MoveandClean — React + Tailwind MVP

This repository contains a minimal React + Tailwind scaffold for the MoveandClean MVP (UI + local JSON backend).

## Quick start

1. Install dependencies
```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom
```

2. Run development server
```bash
npm run dev
```

3. Build for production
```bash
npm run build
```

## Notes
- The project uses a local JSON file (`public/data.json`) as a dummy backend for services and orders.
- Authentication is simulated with `sessionStorage` for the MVP.
- Deploy to Vercel/Netlify: `public/data.json` will be served as a static file automatically.
