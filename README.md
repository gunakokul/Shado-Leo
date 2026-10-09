# Shadow Leo - Monorepo

This repository contains a production-ready scaffold for the Shadow Leo Photography & Videography website.

Structure
- `frontend/` - Next.js public site (portfolio, vault UI)
- `backend/` - Express API + Prisma (gallery, vault auth, DB models)

Quick start (dev)

1. Backend

```bash
cd backend
npm install
# set DATABASE_URL and JWT_SECRET in .env
npx prisma generate
node src/server.js
```

To verify the MongoDB connection from the backend directory:

```bash
npm run test-db
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Notes
- The Prisma schema uses MongoDB Atlas. Set `DATABASE_URL` in `backend/.env`, then run `npx prisma generate` and `npx prisma db push` from `backend/` when applying the schema to a new database.
- The `vault` API uses a PIN hashed with bcrypt; the frontend stores a JWT in `localStorage` for the client vault session.
