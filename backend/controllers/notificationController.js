import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Get notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('relatedBug', 'title status priority')
      .populate('relatedProject', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil((await Notification.countDocuments({ recipient: req.user._id })) / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create notification (for internal use by other controllers)
export const createNotification = async (recipientId, data) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      ...data
    });
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Helper function to create notifications for different events
export const createBugAssignmentNotification = async (developerId, bug, projectName) => {
  return await createNotification(developerId, {
    title: 'New Bug Assigned',
    message: `You have been assigned the bug: ${bug.title}`,
    type: 'bug_assigned',
    relatedBug: bug._id,
    actionUrl: `/developer/dashboard`,
    priority: bug.priority || 'medium'
  });
};

export const createBugResolvedNotification = async (reporterId, bug, resolvedBy, projectName) => {
  return await createNotification(reporterId, {
    title: 'Bug Resolved',
    message: `Your bug "${bug.title}" has been resolved by ${resolvedBy}`,
    type: 'bug_resolved',
    relatedBug: bug._id,
    actionUrl: `/tester/dashboard`,
    priority: 'medium'
  });
};

export const createBugCreatedNotification = async (managerId, bug, reporterName, projectName) => {
  return await createNotification(managerId, {
    title: 'New Bug Reported',
    message: `New bug "${bug.title}" reported by ${reporterName} in project ${projectName}`,
    type: 'bug_created',
    relatedBug: bug._id,
    actionUrl: `/manager/bugs`,
    priority: bug.priority || 'medium'
  });
};

export const createBugReopenedNotification = async (developerId, bug, testerName, projectName) => {
  return await createNotification(developerId, {
    title: 'Bug Reopened',
    message: `Bug "${bug.title}" has been reopened by ${testerName}`,
    type: 'bug_reopened',
    relatedBug: bug._id,
    actionUrl: `/developer/dashboard`,
    priority: 'high'
  });
};