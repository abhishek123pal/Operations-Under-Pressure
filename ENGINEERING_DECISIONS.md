# Engineering Decisions & Architectural Rationale

This document logs concrete architectural choices, state guardrails, and concurrency mitigation strategies enforced within the backend infrastructure.

## 1. State Machine Transitions (`work_items`)
The lifecycle of an operational work item follows strict, linear progression rules: 
\[\text{Open} \longrightarrow \text{In Progress} \longrightarrow \text{Awaiting Approval} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}\]

## 2. Authorization Matrix & Role Enforcement
*   **State Transition Rule:** Transitioning a work item out of the `Awaiting Approval` boundary state (moving to `Resolved` or `Closed`) is strictly isolated.
*   **Role Check:** Only users possessing an authenticated `LEAD` or `ADMIN` role within the respective team's `Membership` record are authorized to execute this state change. Standard `MEMBER` or `VIEWER` roles are rejected at the API middleware layer with a `403 Forbidden` response code.

## 3. Concurrency Control Strategy (OCC)
*   Optimistic Concurrency Control (OCC) is enforced on `work_items` using a monotonic `version` integer field. 
*   Updates must assert `current.version === incomingVersion` and execute an atomic `version + 1` increment inside an isolated single-transaction block (`prisma.$transaction`) to block stale writes and prevent lost updates under heavy load.

## 4. Prisma 7 Native PostgreSQL Driver Adapters (`@prisma/adapter-pg`)
*   **Context:** Prisma 7 deprecates direct string-based engine connections for advanced pool management, mandating explicit driver adapters.
*   **Decision:** Integrated `@prisma/adapter-pg` coupled with `pg.Pool` connection pooling.
*   **Rationale:** Direct pool management allows fine-tuned control over connection lifecycles, preventing socket exhaustion during high-concurrency stress tests and intensive database seeding loops.

## 5. SHA-256 Payload Fingerprinting for Idempotency
*   **Context:** Network partitions and user double-clicks frequently trigger duplicate HTTP requests. Simple key checking is vulnerable to payload tampering under the same key signature.
*   **Decision:** Implemented cryptographic hashing (`crypto.createHash('sha256')`) across both the incoming request URL path and the JSON request body.
*   **Rationale:** If an operator retries a request with the same `Idempotency-Key` header but alters the mutation parameters, the system instantly catches the signature mismatch and aborts with a `409 Conflict`, preventing split-brain database corruption.

## 6. O(1) Keyset Cursor Pagination vs. Offset Pagination
*   **Context:** Traditional offset pagination (`OFFSET / LIMIT`) degrades linearly (O(N)) as deep table scans execute across 3,500+ seeded work items and beyond.
*   **Decision:** Implemented cursor pagination using composite tuple sorting (`[createdAt: 'desc', id: 'desc']`).
*   **Rationale:** Leverages multi-column database indexes to seek directly to the cursor position, maintaining flat query latency regardless of dataset magnitude.
