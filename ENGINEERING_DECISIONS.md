# Engineering Decisions & Architecture Alignment

## 1. State Machine Transitions (`work_items`)
The lifecycle of a work item follows strict, linear progression rules:
`Open` -> `In Progress` -> `Awaiting Approval` -> `Resolved` -> `Closed`

## 2. Authorization Matrix & Role Enforcement
* **State Transition Rule:** Transitioning a work item *out* of the `Awaiting Approval` state (moving to `Resolved` or `Closed`) is strictly restricted.
* **Role Check:** Only users possessing the `LEAD` or `ADMIN` role within the respective team's `Membership` record are authorized to execute this state change. Standard `MEMBER` roles will be rejected at the API middleware layer.

## 3. Concurrency Control Strategy
* Optimistic Concurrency Control (OCC) is enforced on `work_items` using the integer `version` field. Updates must assert `version = current_version` and increment `version + 1` atomically to prevent race conditions under heavy load.