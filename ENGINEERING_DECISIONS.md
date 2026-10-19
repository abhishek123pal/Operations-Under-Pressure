# ⚙️ ENGINEERING_DECISIONS.md

This document outlines the core architectural and design decisions made during the development of **Operations Under Pressure**, detailing the trade-offs evaluated and the rationale behind each choice[cite: 1, 2, 5].

---

## 🛑 1. Concurrency Control: Optimistic Concurrency Control (OCC)

* **Context:** Multiple operators can view and attempt to modify the same high-priority work item simultaneously, creating a risk of race conditions and lost updates[cite: 2, 5].
* **Options Considered:**
  1. *Pessimistic Locking (`SELECT ... FOR UPDATE`):* Locks rows at the database level during read/inspection phases[cite: 3, 5].
  2. *Optimistic Concurrency Control (OCC):* Allows concurrent reads, relying on version numbers (`version`) and conditional checks during writes[cite: 3, 5].
* **Choice:** **Optimistic Concurrency Control (OCC)** coupled with atomic state claims[cite: 3, 5].
* **Trade-off:** Pessimistic locking prevents contention conflicts entirely at the cost of database connection starvation and poor user experience under high traffic. OCC maximizes throughput and allows non-blocking reads, but requires the frontend/client to handle a `409 Conflict` response gracefully and reconcile state when a stale version is submitted[cite: 3, 5].

---

## 📜 2. History & Auditability: Transactional Append-Only Ledger

* **Context:** Enterprise incident management requires complete accountability and historical traceability for every state, priority, and assignee mutation[cite: 2, 5].
* **Options Considered:**
  1. *Mutable History Tables / Audit Triggers:* Relying on database triggers to copy old rows to an audit archive[cite: 3, 5].
  2. *Transactional Append-Only Ledger (`activity_events`):* Writing an explicit activity event record within the exact same database transaction as the primary mutation[cite: 2, 5].
* **Choice:** **Transactional Append-Only Ledger (`activity_events`)** written atomically alongside entity updates[cite: 2, 5].
* **Trade-off:** Storing individual event logs increases database write volume and storage growth over time. However, it guarantees absolute consistency between current state and historical audits, completely eliminating race conditions where state changes occur independently of audit logs[cite: 3, 5].

---

## 🔐 3. Authorization Model: Server-Enforced Middleware

* **Context:** Security rules dictate that certain actions (such as passing the `Awaiting Approval` gate) can only be executed by designated team Leads or Admins, while external users must be restricted[cite: 2, 4, 5].
* **Options Considered:**
  1. *Client-Side Guarding:* Hiding or disabling UI action buttons based on user roles[cite: 4, 5].
  2. *Server-Enforced Middleware & Scoped Service Logic:* Validating headers against relational membership tables inside backend middleware and service layers[cite: 3, 4, 5].
* **Choice:** **Server-Enforced Middleware & Scoped Service Logic**[cite: 3, 4, 5].
* **Trade-off:** Client-side checks are trivial to bypass via direct API calls (e.g., Postman or cURL). Server-enforced checks add latency and implementation complexity due to database lookups on every request, but ensure absolute security and robust access boundaries[cite: 4, 5].

---

## ⚡ 4. Pagination Strategy: Keyset Cursor Pagination

* **Context:** The system must scale efficiently to handle tens of thousands of work items and growing audit trails without performance degradation[cite: 2, 3, 5].
* **Options Considered:**
  1. *Offset-Limit Pagination (`LIMIT offset`):* Traditional page number pagination[cite: 3, 5].
  2. *Keyset Cursor Pagination (Cursor-based tuple comparison on `createdAt` and `id`):* Navigating datasets using pointers from the last fetched record[cite: 3, 5].
* **Choice:** **Keyset Cursor Pagination** backed by multi-column database indexes[cite: 3, 5].
* **Trade-off:** Keyset pagination does not allow jumping directly to an arbitrary page number (e.g., "Page 42"). However, it provides true constant-time query performance regardless of dataset size, whereas offset pagination degrades linearly and causes heavy database overhead on deep pages[cite: 3, 5].

---

## 📨 5. Asynchronous Processing: PostgreSQL Transactional Outbox

* **Context:** System mutations require reliable asynchronous notifications (e.g., assigning tasks or triggering downstream alerts) without risking dual-write failures between the database and an external queue like Redis or RabbitMQ[cite: 3, 5].
* **Options Considered:**
  1. *Direct API Callbacks / Fire-and-Forget:* Triggering async notifications immediately during request execution[cite: 3, 5].
  2. *Transactional Outbox Pattern:* Storing outbox job payloads in a PostgreSQL table within the same transaction as the work item mutation, processed asynchronously by a background worker[cite: 3, 5].
* **Choice:** **PostgreSQL-Backed Transactional Outbox**[cite: 3, 5].
* **Trade-off:** Introduces polling or background worker loops rather than instant event delivery. However, it completely eliminates distributed transaction failure risks (where a database commit succeeds but message publishing fails), guaranteeing at-least-once delivery reliability[cite: 3, 5].