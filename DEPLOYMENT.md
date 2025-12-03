Deployment guide — Frontend (Vercel) + Backend (Render) with Supabase

Overview
- Frontend: deploy to Vercel (build `npm run build`, output `dist`).
- Backend: deploy to Render as a Web Service (always-on) so Socket.IO works.
- Database: Supabase (Postgres). Backend uses the server-only `SUPABASE_KEY` (service_role).

Render (backend) — quick steps
1. Create a new Web Service on Render and connect your repository.
2. Branch: choose `main` (or the branch you use).
3. Build Command: leave blank or `npm install` (Render runs `npm install` automatically if it detects `package.json`).
4. Start Command: `npm run start:api`  (or `node src/backend/server.js`).
5. Environment variables (in Render dashboard > Environment):
   - `SUPABASE_URL` = https://your-project.supabase.co
   - `SUPABASE_KEY` = <service_role_key>  (server-only, rotate immediately if exposed)
   - `NODE_ENV` = production
6. Port: Render will provide `PORT` automatically; the server reads `process.env.PORT`.
7. Deploy the service. Note the public URL Render gives (e.g. `https://moveandclean-backend.onrender.com`).

Vercel (frontend) — quick steps
1. Create a new Vercel project and connect your repository.
2. Build Command: `npm run build`.
3. Output Directory: `dist`.
4. Environment variables (Vercel Project Settings > Environment Variables):
   - `VITE_SUPABASE_URL` = https://your-project.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = <anon_key>  (safe for browser)
   - `VITE_API_BASE` = https://<render-backend-hostname>  (no trailing slash)
5. Deploy. Vercel will build using the Vite config and publish the site.

Notes & Safety
- Do NOT put the Supabase `service_role` key in the frontend. Only the backend should have `SUPABASE_KEY`.
- If you accidentally exposed the service_role key, rotate it immediately in the Supabase dashboard and update the backend env.
- The backend uses Socket.IO — that requires the backend to be always-on (Render, Railway, or a VPS). Vercel Serverless functions won't keep persistent Socket.IO connections.
- CORS: backend currently allows all origins for sockets and API; you can lock it to your production origin later by changing the CORS config in `src/backend/server.js`.

Testing after deploy
1. On Vercel, open the deployed site and register/login.
2. Create a vendor and a service, then create an order.
3. Verify rows appear in Supabase (Table Editor) and that vendor receives Socket.IO events (open devtools console, check socket logs).

Optional: Render `render.yaml`
- If you prefer declarative infra, Render supports `render.yaml`. Create one and set environment variables in the Render dashboard or via their secrets mechanism.

If you want, I can:
- Create a `render.yaml` for a Render Web Service.
- Add a small `health` endpoint or `/health` route to the backend for uptime checks.
- Help set the exact env var values in your Vercel/Render dashboards if you share the hostnames (I won't need keys to write the docs).

Repository helper files included
- `.env.example`: example env vars for local testing and to copy values from when configuring Vercel/Render.
- `vercel.json`: Vercel build config for static output (`dist`) from Vite.
- `render.yaml`: basic Render manifest for the backend (placeholders for secrets).

