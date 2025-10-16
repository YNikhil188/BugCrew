import express from 'express';
import { getBugs, getBugById, createBug, updateBug, deleteBug, assignBug, getBugStats, verifyBug } from '../controllers/bugController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// View routes - all authenticated users can view
router.get('/', protect, getBugs);
router.get('/stats', protect, getBugStats);
router.get('/:id', protect, getBugById);

// Create route - only testers can create bugs
router.post('/', protect, authorize('tester'), upload.array('screenshots', 5), createBug);

// Update route - only developers can update bugs (testers cannot)
router.put('/:id', protect, authorize('developer'), updateBug);

// Delete route - only admins can delete bugs (managers cannot)
router.delete('/:id', protect, authorize('admin'), deleteBug);

// Assign route - admins and managers can assign bugs
router.put('/:id/assign', protect, authorize('admin', 'manager'), assignBug);

// Verify route - testers can verify (close/reopen) resolved bugs they reported
router.put('/:id/verify', protect, authorize('tester'), verifyBug);

export default router;
