🚨 Operations Under Pressure

Operations Under Pressure is an enterprise-grade, high-throughput incident management and workflow orchestration platform engineered to handle high-concurrency environments. Built with Node.js, Express, TypeScript, PostgreSQL, Prisma 7, and a reactive React frontend, the system guarantees strict data consistency and fault tolerance through Optimistic Concurrency Control (OCC), cryptographic idempotency, and transactional outbox patterns.

🛠️ Tech Stack

• Backend: Node.js, Express, TypeScript, Prisma ORM
• Database & Concurrency: PostgreSQL, ACID Transactions, Optimistic Locking, SHA-256 Idempotency
• Frontend: React, TypeScript, Vite, Custom Responsive Command Center
• Testing: Jest, Supertest (Integration Suite)

⚙️ Prerequisites & Environment Setup


Prerequisites

• Docker Desktop (with WSL2/container backend running)
• Node.js (v20.x or higher)
• npm (v10.x or higher)

Environment Variables (.env.example)

Create a .env file inside your backend/ directory using the following configuration:
env
# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/operations_db?schema=public"
PORT=4000
Use code with caution.

🚀 Exact Run Commands

Execute the following commands sequentially from your terminal to provision the stack and run the application:
bash
# 1. Start the containerized PostgreSQL database instance
docker compose up -d

# 2. Setup and seed the backend (migrations, client generation, and 3,500+ mock records)
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 3. Start the backend server (runs on port 4000)
npx tsx src/app.ts

# 4. In a separate terminal, start the frontend client (runs on port 5173)
cd ../frontend
npm install
npm run dev
Use code with caution.

👥 Demo Login Credentials & Roles

The seed script provisions pre-authenticated teams and operators mapped to specific role boundaries:

Role	Team Assignment	Permissions & Capabilities	Seed ID Reference
Admin	Core Infrastructure	Full system oversight, team-wide policy governance, and unrestricted transition rights.	user-uuid-1
Lead	Incident Response Team	Authorized to approve state transitions (e.g., passing the Awaiting Approval gate) and reassign items.	user-uuid-2
Member	Engineering Operations	Standard operational claim, update, and comment capabilities.	user-uuid-3
Viewer	Global Read-Only	Read-only access to tactical queues and historical activity logs.	user-uuid-4

Note: The frontend automatically binds these credentials securely via x-user-id and x-team-id request headers on boot.

🧪 How to Run Tests

The repository includes a comprehensive integration test suite verifying critical backend behaviors (concurrent claims, OCC version mismatches, idempotency duplicate checks, and authorization boundaries).
To run the automated test suite:
bash
cd backend
npm test
Use code with caution.

⚠️ Known Limitations

• Polling vs. WebSockets: Real-time updates rely on active frontend state refetching and polling intervals rather than bidirectional WebSocket streaming.
• Single-Region Deployment: The database locking and outbox worker patterns are optimized for single-node Postgres deployments rather than distributed multi-region replication clusters.
• Authentication Layer: Auth is handled via verified custom headers (x-user-id, x-team-id) mapped to seed records rather than full OAuth/JWT token issuance flows.

🔮 Next Week I Would... (Future Scaling & Architecture Roadmap)

Given another week of development, the roadmap would transition from a single-node monolithic enterprise prototype to a horizontally scalable distributed system:
• Real-Time WebSocket Streaming (Socket.io / Redis Pub-Sub):
	• Replace polling and manual refresh triggers with real-time bidirectional event streaming.
	• When an operator updates an item or triggers an OCC conflict, broadcast state diffs instantly to all connected team members viewing the same tactical queue.
• Full-Text Search Engine Integration (Elasticsearch / PostgreSQL tsvector):
	• Upgrade key-value filtering and basic queries to a dedicated inverted-index search engine.
	• Enable sub-millisecond fuzzy search, faceted filtering, and multi-field aggregations across tens of thousands of incident logs and work items.
• Distributed Job Queue (BullMQ + Redis):
	• Migrate the current PostgreSQL-backed transactional outbox worker to an enterprise Redis-backed queue (BullMQ).
	• Implement concurrency rate-limiting, exponential backoff retries, and dead-letter queues for high-volume third-party webhook integrations (e.g., PagerDuty, Slack alerts).
• OAuth2 & Role-Based Access Control (RBAC) Token Service:
	• Replace custom header injection (x-user-id) with secure JSON Web Tokens (JWT) or session cookies managed via Passport.js or Auth0.
	• Introduce dynamic organization-level scoping where administrators can configure custom permission matrices per team directly from the UI.
If you want to refine this further, let me know if you would like me to change the visual style, adjust the formatting of the commands, or restructure the tables.
