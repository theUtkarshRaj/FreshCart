### FreshCart

Modern full‑stack grocery e‑commerce app built with React (Vite) + Express/MongoDB.

## Features
- **Auth**: JWT login/signup, protected routes, admin role
- **Catalog**: Products list, categories, search, featured
- **Cart & Checkout**: Persisted cart per user, order creation
- **Admin**: Manage products, users, orders (server‑side routes)
- **Media**: Image serving via API, scripts to upload/repair images

## Tech Stack
- **Frontend**: React 19, React Router, Tailwind CSS 4 (via `@tailwindcss/vite`), Vite 7
- **Backend**: Node.js, Express 4, Mongoose 8, JWT, bcryptjs, CORS, morgan
- **Database**: MongoDB

## Monorepo Layout
```
frontend/   # React web app (Vite)
server/     # Express API + MongoDB models and scripts
```

## Quick Start (Windows PowerShell)
1) Install dependencies
```powershell
cd server; npm i; cd ..
cd frontend; npm i; cd ..
```

2) Configure environment
- Create `server/.env` (see variables below)
- Create `frontend/.env` with `VITE_API_URL` pointing to the API (e.g. `http://localhost:5000`)

3) Run development servers (two shells)
```powershell
# Shell 1 (API)
cd server; npm run dev

# Shell 2 (Web)
cd frontend; npm run dev
```

4) Open the app
- Vite dev server URL printed in the console (typically `http://localhost:5173`)
- API health check: `GET http://localhost:5000/api/health` → `{ ok: true }`

## Environment Variables
Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000
```

Server (`server/.env`)
```
# Core
MONGO_URI=mongodb://127.0.0.1:27017/freshcart
PORT=5000
JWT_SECRET=replace-with-strong-secret

# CORS (comma‑separated origins, or omit for "*")
CORS_ORIGIN=http://localhost:5173

# Optional: enable /api/products/seed endpoint for dev convenience
ALLOW_DEV_SEED=true
```

Notes
- If `CORS_ORIGIN` is not set, the server allows `*` during development.
- On port conflict, the API will attempt `PORT+1` once and print a hint.

## NPM Scripts
Frontend (`frontend/package.json`)
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built app
- `npm run lint` – run ESLint

Server (`server/package.json`)
- `npm run dev` – start API with nodemon
- `npm start` – start API
- `npm run seed` – seed demo data
- `npm run seed:json` – seed from JSON file
- `npm run seed:assets` – seed using local assets
- `npm run upload:assets` – upload assets to GridFS (images)
- `npm run backfill:images` – backfill product image references
- `npm run repair:images` – repair product image URLs
- `npm run dedupe` – de‑duplicate products
- `npm run create:admin` – create an admin user

## Seeding Data
1) Ensure MongoDB is running and `server/.env` is configured.
2) From `server/` run one of:
```powershell
npm run seed           # General seed
npm run seed:json      # From JSON
npm run seed:assets    # From assets in frontend/src/assets
```

If you enabled `ALLOW_DEV_SEED=true`, you can also POST to `/api/products/seed` with a list of products to quickly reset the catalog during development.

## API Overview
Base URL: `${PORT || 5000}` (default `http://localhost:5000`)

- `GET /api/health` – health check

Auth
- `POST /api/auth/signup` – { name, email, password } → { token, user }
- `POST /api/auth/login` – { email, password } → { token, user }
- `GET /api/auth/me` – current user (Bearer token)

Products
- `GET /api/products` – list (query: `search`, `category`, `featured`)
- `GET /api/products/:id` – detail
- `GET /api/products/categories` – distinct categories
- `POST /api/products` – create (admin)
- `PUT /api/products/:id` – update (admin)
- `DELETE /api/products/:id` – delete (admin)
- `POST /api/products/seed` – dev‑only seed when `ALLOW_DEV_SEED=true`

Cart
- `GET /api/cart` – get my cart (auth)
- `POST /api/cart/set` – replace items (auth)

Orders
- `POST /api/orders` – create order (auth)
- `GET /api/orders/my` – my orders (auth)
- `GET /api/orders` – list all (admin)
- `PATCH /api/orders/:id/status` – update status (admin)

Users
- `GET /api/users` – list users (admin)
- `PUT /api/users/me` – update my profile (auth)

Images
- `GET /api/images/:id` – fetch image (e.g., GridFS)

## Frontend Configuration
The frontend reads `VITE_API_URL` at build time. Default is `http://localhost:5000`. You can override by creating `frontend/.env`.

## Troubleshooting
- **Port in use**: Change `PORT` in `server/.env` or stop the other process. The server will try `PORT+1` once.
- **CORS errors**: Set `CORS_ORIGIN=http://localhost:5173` (or the actual origin) in `server/.env`.
- **JWT invalid**: Ensure `JWT_SECRET` matches between signup/login cycles; re‑login after secret changes.
- **Mongo replica warnings** on order creation: The API falls back gracefully if transactions aren’t available.

## License
MIT (or project default). Update as needed.

## Docker Deployment

This repo includes production‑ready Dockerfiles and a `docker-compose.yml` to run MongoDB, the API, and an Nginx‑served frontend (with `/api` proxied to the API).

### 1) Configure secrets
Create a `.env` file or set environment variables for the `server` service at deploy time. With Compose you can also edit `docker-compose.yml`:
```
JWT_SECRET=replace-with-strong-secret
MONGO_URI=mongodb://mongo:27017/freshcart
```

Frontend build uses `VITE_API_URL` (passed as a build arg in Compose). Default in Compose is `http://localhost:5000`.

### 2) Build and run
```bash
docker compose up -d --build
```

### 3) Access
- Frontend: `http://localhost`
- API health: `http://localhost:5000/api/health`

### 4) Production notes
- Update `JWT_SECRET` and `CORS_ORIGIN` in `docker-compose.yml` (or inject at runtime) to your domains.
- To host on a remote server with a domain + TLS, put a reverse proxy (e.g., Traefik/Nginx/Cloudflare Tunnel) in front of the `frontend` service.
- To use MongoDB Atlas instead of the `mongo` container, set `MONGO_URI` to your Atlas URI and remove/disable the `mongo` service.


