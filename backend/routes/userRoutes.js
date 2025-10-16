import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, toggleUserActive, getUsersByRole } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), getUsers);
router.get('/role/:role', protect, getUsersByRole);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);

export default router;
