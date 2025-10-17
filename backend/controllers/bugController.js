import Bug from '../models/Bug.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendBugAssignmentEmail, sendBugResolvedEmail } from '../utils/emailService.js';
import { 
  createBugAssignmentNotification, 
  createBugResolvedNotification, 
  createBugCreatedNotification, 
  createBugReopenedNotification 
} from './notificationController.js';

export const getBugs = async (req, res) => {
  try {
    const query = {};
    // Developers see only bugs assigned to them
    if (req.user.role === 'developer') query.assignedTo = req.user._id;
    // Testers see only bugs they reported
    if (req.user.role === 'tester') query.reporter = req.user._id;
    // Admins and Managers see all bugs (read-only for both)
    // if (req.user.role === 'admin' || req.user.role === 'manager') - no query restriction
    
    if (req.query.project) query.project = req.query.project;
    
    const bugs = await Bug.find(query)
      .populate('project', 'name')
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('project')
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email avatar');
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBug = async (req, res) => {
  try {
    const bug = await Bug.create({
      ...req.body,
      reporter: req.user._id,
      screenshots: req.files ? req.files.map(file => file.filename) : []
    });
    
    // Populate bug for email
    await bug.populate('project', 'name');
    
    // Send notification to manager about new bug
    try {
      const manager = await User.findOne({ role: 'manager' });
      if (manager) {
        // Send email notification
        const { sendBugCreatedEmail } = await import('../utils/emailService.js');
        await sendBugCreatedEmail(
          manager.email,
          bug.title,
          req.user.name,
          bug.project.name,
          bug.priority,
          `${process.env.FRONTEND_URL}/manager/bugs`
        );
        
        // Create in-app notification
        await createBugCreatedNotification(
          manager._id,
          bug,
          req.user.name,
          bug.project.name
        );
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }
    
    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    
    const oldStatus = bug.status;
    Object.assign(bug, req.body);
    
    if (req.body.status === 'resolved' && oldStatus !== 'resolved') {
      bug.resolvedAt = Date.now();
      const project = await Project.findById(bug.project);
      const reporter = await User.findById(bug.reporter);
      try {
        // Send email notification
        await sendBugResolvedEmail(reporter.email, bug.title, req.user.name, project.name);
        
        // Create in-app notification
        await createBugResolvedNotification(
          reporter._id,
          bug,
          req.user.name,
          project.name
        );
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }
    
    await bug.save();
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    await bug.deleteOne();
    res.json({ message: 'Bug removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    
    const { userId, sendEmail } = req.body;
    
    // Validate that bugs can only be assigned to developers
    const assignee = await User.findById(userId);
    if (!assignee) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (assignee.role !== 'developer') {
      return res.status(400).json({ message: 'Bugs can only be assigned to developers' });
    }
    
    bug.assignedTo = userId;
    bug.status = 'in-progress';
    await bug.save();
    
    // Populate the bug data before returning
    await bug.populate('assignedTo', 'name email');
    await bug.populate('reporter', 'name email');
    await bug.populate('project', 'name');
    
    // Send email only if sendEmail is not explicitly false
    if (sendEmail !== false) {
      const user = await User.findById(userId);
      const project = await Project.findById(bug.project);
      try {
        // Send email notification
        await sendBugAssignmentEmail(
          user.email,
          bug.title,
          user.name,
          project.name,
          `${process.env.FRONTEND_URL}/bugs/${bug._id}`
        );
        
        // Create in-app notification
        await createBugAssignmentNotification(
          userId,
          bug,
          project.name
        );
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }
    
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBugStats = async (req, res) => {
  try {
    const stats = await Bug.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const priorityStats = await Bug.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    res.json({ statusStats: stats, priorityStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tester verification - close or reopen bug
export const verifyBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    
    // Only allow tester who reported the bug to verify
    if (bug.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the reporter can verify this bug' });
    }
    
    // Only allow verification if bug is resolved
    if (bug.status !== 'resolved') {
      return res.status(400).json({ message: 'Bug must be resolved before verification' });
    }
    
    const { action } = req.body; // 'close' or 'reopen'
    
    if (action === 'close') {
      bug.status = 'closed';
      bug.closedAt = Date.now();
    } else if (action === 'reopen') {
      bug.status = 'reopened';
      
      // Notify developer that bug was reopened
      if (bug.assignedTo) {
        try {
          const developer = await User.findById(bug.assignedTo);
          const project = await Project.findById(bug.project);
          
          // Send email notification
          const { sendBugReopenedEmail } = await import('../utils/emailService.js');
          await sendBugReopenedEmail(
            developer.email,
            bug.title,
            developer.name,
            project.name,
            req.user.name,
            `${process.env.FRONTEND_URL}/developer/dashboard`
          );
          
          // Create in-app notification
          await createBugReopenedNotification(
            developer._id,
            bug,
            req.user.name,
            project.name
          );
        } catch (emailError) {
          console.error('Email error:', emailError);
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "close" or "reopen"' });
    }
    
    await bug.save();
    
    // Populate before returning
    await bug.populate('project', 'name');
    await bug.populate('reporter', 'name email');
    await bug.populate('assignedTo', 'name email');
    
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
