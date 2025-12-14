# Deploy to aaPanel (Apache) — Quick Guide

This file explains the minimal steps and the example files included in this repo to deploy the frontend (Vite app) and the Node backend to a server managed by aaPanel using Apache as the webserver.

Files added to this repo:

- `deploy/apache-vhost.conf` — example Apache VirtualHost config. Adjust `ServerName` and `DocumentRoot`.
- `deploy/.htaccess` — SPA fallback rules for the frontend `dist` folder.
- `backend/ecosystem.config.js` — `pm2` configuration to run the backend in production.
- `backend/.env.production.example` — example env file for backend.

High-level steps

1. Build frontend

   Locally (or on server if you prefer):

   ```bash
   npm install
   npm run build
   ```

   The frontend build output will be in the `dist/` folder.

2. Upload frontend to aaPanel site root

   - In aaPanel create a website (example: `example.com`) and note its site root (commonly `/www/wwwroot/example.com`).
   - Upload contents of this repo's `dist/` to the site root (so `index.html` is at `/www/wwwroot/example.com/index.html`).
   - Place the provided `deploy/.htaccess` into the site root (or ensure `AllowOverride All` so rewrites work).

3. Apache VirtualHost / Proxy configuration

   - If you prefer to paste full conf, use `deploy/apache-vhost.conf` as a reference. Replace `example.com` and paths.
   - Important: enable required Apache modules on the server:

     ```bash
     sudo a2enmod proxy proxy_http rewrite headers
     sudo systemctl restart apache2
     ```

   - If you use aaPanel UI you can configure domain and set root folder there; also add Proxy settings to route `/api` to `127.0.0.1:5000`.

4. Start backend (Node) with PM2

   On the server, in the project folder:

   ```bash
   cd /path/to/project
   # Install server deps
   cd backend
   npm install --production

   # Copy and fill production env
   cp .env.production.example .env
   # edit .env to set MONGO_URI, JWT_SECRET, etc.

   # Install pm2 (if not installed)
   npm install -g pm2

   # Start via PM2
   pm2 start ../backend/ecosystem.config.js --env production
   pm2 save
   ```

   - Confirm the backend is listening on `127.0.0.1:5000`. If you change the port, update `deploy/apache-vhost.conf` or the aaPanel proxy settings.

5. SSL

   - Use aaPanel's Let's Encrypt feature to issue/renew certificates for the domain.

Notes and tips

- If your frontend expects the API under a certain base path (e.g., `/api`), proxy those requests from Apache to the backend. If the frontend calls a different host, update `vite` env values before build (e.g., `VITE_API_BASE_URL`).
- If you prefer to run both frontend and backend from a single Node process (serve `dist` statically and use backend routes), you can implement a static-serving route in the `backend` express app and run the backend on port 80 (not recommended when Apache is used).
- Keep secrets out of the repo. Use aaPanel's environment or server-side `.env` files that are not committed.

If you want, I can:

- Adjust `deploy/apache-vhost.conf` to use a different API path or port.
- Create a small Express static-serving snippet to serve `dist/` from the backend instead of Apache.
- Create a `deploy/script-setup.sh` that automates a2enmod, copying files, and pm2 start commands.

Domain-specific notes for `buiducthuan.pro`

- I added `deploy/apache-vhost-buiducthuan.conf` as a ready-to-edit VirtualHost for `buiducthuan.pro`.
- Defaults used in that config:
  - Site root (frontend): `/www/wwwroot/buiducthuan.pro/dist` — change if your aaPanel site root differs.
  - Backend on `127.0.0.1:5000` — ensure `backend` runs on that port (set `PORT=5000` in `backend/.env`).
  - SSL cert paths point to `/etc/letsencrypt/live/buiducthuan.pro/...` — aaPanel's Let's Encrypt will typically place certs there when enabled.

Vite / frontend note

- Ensure your frontend sends API requests to the same origin under `/api`. Set `VITE_API_BASE_URL` (or your app's env key) to `/api` before building so the built app calls `https://buiducthuan.pro/api/...`.

Example: in `.env` used for build

```
VITE_API_BASE_URL=/api
```

aaPanel UI steps recap (quick):

1. Create site `buiducthuan.pro` in aaPanel; set site root to `/www/wwwroot/buiducthuan.pro`.
2. Upload frontend `dist/` to `/www/wwwroot/buiducthuan.pro/dist` and place `deploy/.htaccess` there.
3. In aaPanel Website -> Domain/SSL enable Let's Encrypt for `buiducthuan.pro`.
4. Configure Reverse Proxy in aaPanel (or paste `deploy/apache-vhost-buiducthuan.conf` into Apache conf editor): proxy `/api` → `127.0.0.1:5000`.
5. Start backend with PM2 (via aaPanel PM2 plugin or SSH):

```bash
cd /path/to/project
cd backend
npm install --production
cp .env.production.example .env
# edit .env to set MONGO_URI and JWT_SECRET
pm2 start ../backend/ecosystem.config.js --env production
pm2 save
pm2 startup
```

If you want, I can also create a small `deploy/script-setup.sh` that automates the SSH commands above (useful when you have shell access).
