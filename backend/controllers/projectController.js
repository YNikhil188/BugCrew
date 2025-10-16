import Project from '../models/Project.js';
import { sendProjectAssignmentEmail } from '../utils/emailService.js';
import User from '../models/User.js';

export const getProjects = async (req, res) => {
  try {
    // Allow all authenticated users to view all projects
    // Developers and testers can view all projects but can only update their assigned ones
    const projects = await Project.find({}).populate('manager', 'name email').populate('team.user', 'name email role');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('team.user', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      manager: req.user.role === 'manager' ? req.user._id : req.body.manager
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const { userId, role, sendEmail } = req.body;
    
    // Check if user is already in team
    const existingMember = project.team.find(m => m.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }
    
    project.team.push({ user: userId, role });
    await project.save();
    
    const user = await User.findById(userId);
    
    // Send email only if sendEmail is true
    if (sendEmail !== false) {
      try {
        await sendProjectAssignmentEmail(
          user.email,
          project.name,
          user.name,
          role,
          `${process.env.FRONTEND_URL}/projects/${project._id}`
        );
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }
    
    // Populate before returning
    await project.populate('team.user', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.team = project.team.filter(member => member.user.toString() !== req.params.userId);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
