import React, { createContext, useContext, useReducer, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n._id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      const notification = state.notifications.find(n => n._id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n._id !== action.payload),
        unreadCount: notification && !notification.isRead ? 
          Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
  currentPage: 1,
  totalPages: 1
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, token } = useContext(AuthContext);

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!token) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${API_BASE_URL}/api/notifications?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_UNREAD_COUNT', payload: data.count });
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        dispatch({ type: 'MARK_AS_READ', payload: notificationId });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        dispatch({ type: 'MARK_ALL_AS_READ' });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, token]);

  // Poll for unread count periodically
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};