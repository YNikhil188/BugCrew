import express from 'express';
import { getCommentsByBug, createComment, updateComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/bug/:bugId', protect, getCommentsByBug);
router.post('/bug/:bugId', protect, upload.array('attachments', 3), createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
