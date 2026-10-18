// import { Router } from 'express';
// import { WorkItemController } from '../controllers/workItem.controller';
// import { authMiddleware } from '../middleware/auth.middleware';
// import { idempotencyMiddleware } from '../middleware/idempotency.middleware';

// const router = Router();

// router.get('/items/bootstrap', WorkItemController.getBootstrapSample);
// // Apply auth middleware to all work item routes
// router.use(authMiddleware);

// // Keyset pagination route
// router.get('/', WorkItemController.getItems);

// // Atomic claim endpoint (protected by idempotency middleware)
// router.post('/:id/claim', idempotencyMiddleware, WorkItemController.claimItem);

// // Optimistic Concurrency Control (OCC) update endpoint (protected by idempotency middleware)
// router.patch('/:id', idempotencyMiddleware, WorkItemController.updateItem);

// export default router;
import { Router } from 'express';
import { WorkItemController } from '../controllers/workItem.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { idempotencyMiddleware } from '../middleware/idempotency.middleware';

const router = Router();

// Public bootstrap endpoint (placed before auth middleware)
router.get('/bootstrap', WorkItemController.getBootstrapSample);

// Apply auth middleware to all subsequent work item routes
router.use(authMiddleware);

// Keyset pagination route
router.get('/', WorkItemController.getItems);

// Atomic claim endpoint (protected by idempotency middleware)
router.post('/:id/claim', idempotencyMiddleware, WorkItemController.claimItem);

// Optimistic Concurrency Control (OCC) update endpoint (protected by idempotency middleware)
router.patch('/:id', idempotencyMiddleware, WorkItemController.updateItem);

export default router;