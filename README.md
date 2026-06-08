# 🧭 CareerPilot AI: The Career GPS

CareerPilot AI is a premium, production-grade SaaS "Career GPS" that tracks your current skill coordinates, maps missing gaps, recommends difficulty-tiered portfolio projects, hosts baseline validation quizzes, and guides you step-by-step to your target role.

---

## 🏗️ Architecture Overview

The system is configured as a modular codebase:
1. **Frontend (`/frontend`)**: Built with **Next.js**, React 19, Recharts, and Tailwind CSS.
2. **Backend (`/backend`)**: Built with **NestJS**, Prisma ORM, and SQLite (local-first storage adapter).
3. **AI Engine**: Contextual Gemini 1.5 Flash integrations with deterministic local regex matching fallbacks.

---

## ⚡ Local Quickstart

### Step 1: Install Dependencies
From the root workspace folder, run:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 2: Seed local database coordinates
From the `backend` folder, run:
```bash
npx ts-node prisma/seed.ts
```
*This seeds target roles, technical skill categories, importance weights, recommended projects blueprints, quiz questions, resources, and default test accounts.*

### Step 3: Run Dev Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run start:dev
```
*(Runs NestJS at `http://localhost:4000`)*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*(Runs Next.js at `http://localhost:3000`)*

Open **`http://localhost:3000`** in your browser. All API requests are proxied automatically!

---

## 👥 Default test credentials

* **System Admin Account**: `admin@careerpilot.ai` / `AdminPass123!` *(Accesses the `/admin` CRUD panels)*
* **Standard User Account**: `user@careerpilot.ai` / `UserPass123!` *(Accesses dashboard, resume parsed analysis, and roadmaps)*

---

## 🚀 GitHub & Vercel Production Deployment Guide

Follow these steps to deploy CareerPilot AI to production:

### 1. Initialize Git & push to GitHub
Run the following from the root workspace directory:
```bash
git init
git add .
git commit -m "feat: initial production-grade careerpilot release"
# Create a repository on GitHub, then link and push:
git remote add origin https://github.com/your-username/careerpilot-ai.git
git branch -M main
git push -u origin main
```

### 2. Deploy the Next.js Frontend to Vercel
* **Live Production Link**: https://frontend-livid-six-59.vercel.app
* **Deployment Steps**:
  1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
  2. Select your imported `careerpilot-ai` GitHub repository.
  3. Configure the **Root Directory** as `frontend`.
  4. In the **Environment Variables** section, add the following key:
     * **Key**: `BACKEND_API_URL`
     * **Value**: *Your deployed backend service URL* (e.g. `https://api.careerpilot.ai`)
  5. Click **Deploy**. Vercel will build and optimize your static pages and serverless routes.

### 3. Deploy the NestJS Backend
Since NestJS and SQLite are stateful, you should deploy the backend container to a host like Render, Railway, Fly.io, or AWS ECS:
1. Link your GitHub repository.
2. Configure build settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm run start:prod`
3. Add environment variables:
   * `JWT_SECRET`: *Your JWT signing key*
   * `JWT_REFRESH_SECRET`: *Your JWT refresh key*
   * `GEMINI_API_KEY`: *Optional. If provided, enables Gemini LLM features. If omitted, falls back to deterministic local parsers.*
4. **Prisma Note**: For production, change `provider = "sqlite"` in `backend/prisma/schema.prisma` to `provider = "postgresql"` and configure the `DATABASE_URL` pointing to a managed PostgreSQL cluster (e.g. Supabase, Render Pg, AWS RDS).
