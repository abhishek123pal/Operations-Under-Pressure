# Operations Under Pressure (Backend)

An enterprise-grade, high-throughput task management and workflow orchestration engine engineered to withstand high-concurrency environments and systemic faults. Built using Node.js, TypeScript, PostgreSQL, and Prisma ORM, this platform implements resilient distributed systems design patterns—including Optimistic Concurrency Control (OCC), rigorous Idempotency guarantees, and the Transactional Outbox pattern—to ensure absolute data consistency under heavy workloads.

## 🏗️ System Architecture Features

The backend infrastructure is architected around fault-tolerant core primitives designed to eliminate race conditions, duplicate mutations, and state corruption:

*   **Optimistic Concurrency Control (OCC):** Enforces integer-based version tracking on high-contention resources (`work_items`). Concurrent mutations assert version parity to prevent lost updates and race conditions under heavy load.
*   **Transactional Outbox Pattern:** Decouples database writes from downstream asynchronous event distribution via an `outbox_jobs` queue, guaranteeing reliable message publishing without dual-write failures.
*   **Strict Finite State Machine (FSM):** Enforces governed lifecycle progression for operational items:
    \[\text{Open} \longrightarrow \text{In Progress} \longrightarrow \text{Awaiting Approval} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}\]
*   **Authorization Guardrail:** State transitions exiting the `Awaiting Approval` boundary are strictly restricted at the middleware layer to users holding authenticated `LEAD` or `ADMIN` team memberships.
*   **Cryptographic Idempotency Middleware:** Intercepts mutating HTTP requests via `Idempotency-Key` headers, fingerprinting URL payloads with SHA-256 hashes to prevent double-clicks and duplicate network retries.
*   **O(1) Keyset Cursor Pagination:** Replaces slow offset pagination with composite tuple sorting (`createdAt`, `id`) backed by multi-column indexes for constant-time scaling across millions of rows.

---

## ⚙️ Getting Started & Environment Provisioning

### Prerequisites
Ensure your local development environment meets the following baseline requirements:
*   **Docker Desktop** (with WSL2 engine backend enabled for Windows)
*   **Node.js** (v22.x or higher)
*   **npm** (v9.0.0 or higher)

### Environment Variables
Create a `.env` file in the `backend/` directory matching the following structure:

```env
# Database Connection URL (configured for Docker container on port 5433 to avoid host conflicts)
DATABASE_URL="postgresql://postgres:password123@localhost:5433/operations_db?schema=public"
PORT=4000
```

### Installation & Initialization
Execute the following commands sequentially within your terminal to provision the database infrastructure, spin up your network pool, and run the high-volume data seeder:

```bash
# 1. Provision the containerized PostgreSQL instance in the background
docker compose up -d

# 2. Navigate to the backend directory and install dependencies
cd backend
npm install --legacy-peer-deps

# 3. Validate the structural integrity of the Prisma schema
npx prisma validate

# 4. Generate the type-safe Prisma client bindings
npx prisma generate

# 5. Seed 3,500+ mock work items, operators, and tactical teams for stress-testing
npx tsx prisma/seed.ts
```

### 🚀 Running the Server
```bash
# Boot the production-grade development server with tsx
npx tsx src/app.ts
```

---

## 📊 Project Milestone Tracking

| Phase | Milestone Description | Status | Target Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Architecture & Requirements Alignment | [✅] Completed | Dockerized PostgreSQL setup, Prisma 7 runtimes, Core Entities Schema, FSM & Auth Matrix (`ENGINEERING_DECISIONS.md`). |
| **Phase 2** | Core Backend & Critical Concurrency Engineering | [✅] Completed | Seeding 3,500+ records, tenant auth middleware, cryptographic idempotency checks, atomic claims, and OCC transaction boundaries. |
| **Phase 3** | Frontend Interface & Concurrency Simulation | [ ] Pending | Frontend interface construction and live distributed concurrency stress dashboard mapping. |
