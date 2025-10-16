import express from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, addTeamMember, removeTeamMember } from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// View routes - all authenticated users can view projects
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);

// Manage routes - only managers can create, delete projects and manage team
router.post('/', protect, authorize('manager'), createProject);
// Developers and managers can update projects (developers only if assigned)
router.put('/:id', protect, authorize('manager', 'developer'), updateProject);
router.delete('/:id', protect, authorize('manager'), deleteProject);
router.post('/:id/team', protect, authorize('manager'), addTeamMember);
router.delete('/:id/team/:userId', protect, authorize('manager'), removeTeamMember);

export default router;
