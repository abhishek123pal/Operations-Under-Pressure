# Operations Under Pressure (Backend)

An enterprise-grade, high-throughput task management and workflow orchestration engine engineered to withstand high-concurrency environments and systemic faults. Built using Node.js, TypeScript, PostgreSQL, and Prisma ORM, this platform implements resilient distributed systems design patterns—including Optimistic Concurrency Control (OCC), rigorous Idempotency guarantees, and the Transactional Outbox pattern—to ensure absolute data consistency under heavy workloads.

## 🏗️ System Architecture Features

The backend infrastructure is architected around fault-tolerant core primitives designed to eliminate race conditions, duplicate mutations, and state corruption:

*   **Optimistic Concurrency Control (OCC):** Enforces integer-based version tracking on high-contention resources (`work_items`). Concurrent mutations assert version parity to prevent lost updates and race conditions under heavy load.
*   **Transactional Outbox Pattern:** Decouples database writes from downstream asynchronous event distribution via an `outbox_jobs` queue, guaranteeing reliable message publishing without dual-write failures.
*   **Strict Finite State Machine (FSM):** Enforces governed lifecycle progression for operational items:
    \[\text{Open} \longrightarrow \text{In Progress} \longrightarrow \text{Awaiting Approval} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}\]
*   **Authorization Guardrail:** State transitions exiting the `Awaiting Approval` boundary are strictly restricted at the middleware layer to users holding authenticated `LEAD` or `ADMIN` team memberships.
*   **Idempotent API Design:** Implements hash-based request tracking (`idempotency_keys`) to guarantee safe execution retries and prevent duplicate side effects under unstable network conditions.

---

## ⚙️ Getting Started & Environment Provisioning

### Prerequisites
Ensure your local development environment meets the following baseline requirements:
*   **Docker Desktop** (with WSL2 engine backend enabled for Windows)
*   **Node.js** (v18.0.0 or higher)
*   **npm** (v9.0.0 or higher)

### Environment Variables
Create a `.env` file in the `backend/` directory matching the following structure:

```env
# Database Connection URL (configured for Docker container on port 5433 to avoid host conflicts)
DATABASE_URL="postgresql://postgres:password123@localhost:5433/operations_db?schema=public"
```

### Installation & Initialization
Execute the following commands sequentially within your terminal to provision the database infrastructure and validate the runtime environment:

```bash
# 1. Provision the containerized PostgreSQL instance in the background
docker compose up -d

# 2. Navigate to the backend directory and install dependencies
cd backend
npm install

# 3. Validate the structural integrity of the Prisma schema
npx prisma validate

# 4. Run initial database migration to synchronize the schema structure
npx prisma migrate dev --name init
```

---

## 📊 Project Milestone Tracking

| Phase | Milestone Description | Status | Target Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Architecture & Requirements Alignment | [✅] Completed | Dockerized PostgreSQL setup, Prisma 7 runtimes, Core Entities Schema, FSM & Auth Matrix (`ENGINEERING_DECISIONS.md`). |
| **Phase 2** | Core API Implementation | [ ] Pending | RESTful endpoints development, request payload validation, and service layer assembly. |
