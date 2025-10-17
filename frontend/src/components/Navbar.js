import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = ({ user }) => {
  const { logout } = useContext(AuthContext);
  const { toggleMobileMenu } = useSidebar();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bug_assigned':
        return 'bi-bug-fill text-danger';
      case 'bug_resolved':
        return 'bi-check-circle-fill text-success';
      case 'bug_created':
        return 'bi-exclamation-triangle-fill text-warning';
      case 'bug_reopened':
        return 'bi-arrow-counterclockwise text-warning';
      case 'project_assigned':
        return 'bi-folder-fill text-primary';
      default:
        return 'bi-info-circle-fill text-info';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <motion.nav
      className="navbar navbar-custom"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center flex-grow-1">
          <button 
            className="btn btn-link text-dark d-md-none"
            onClick={() => {
              console.log('Hamburger clicked!');
              toggleMobileMenu();
            }}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <div className="input-group ms-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="dropdown">
            <button
              className="btn btn-link text-dark position-relative"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-bell fs-5"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" style={{ minWidth: '350px', maxHeight: '500px', overflowY: 'auto' }}>
              <li>
                <div className="dropdown-header d-flex justify-content-between align-items-center">
                  <span>Notifications</span>
                  <div className="d-flex gap-2 align-items-center">
                    {unreadCount > 0 && (
                      <span className="badge bg-danger">{unreadCount}</span>
                    )}
                    {unreadCount > 0 && (
                      <button 
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          markAllAsRead();
                        }}
                        title="Mark all as read"
                      >
                        <i className="bi bi-check-all"></i>
                      </button>
                    )}
                  </div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              {notifications.length === 0 ? (
                <li className="text-center py-3 text-muted">
                  <i className="bi bi-bell-slash fs-3 d-block mb-2"></i>
                  <small>No notifications yet</small>
                </li>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <li key={notification._id}>
                    <a 
                      className={`dropdown-item py-2 ${notification.isRead ? '' : 'bg-light'}`} 
                      href="#" 
                      style={{ whiteSpace: 'normal' }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }}
                    >
                      <div className="d-flex align-items-start">
                        <i className={`${getNotificationIcon(notification.type)} me-2 mt-1`}></i>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <strong className={notification.isRead ? '' : 'fw-bold'}>
                              {notification.title}
                            </strong>
                            <small className="text-muted ms-2">
                              {formatTimeAgo(notification.createdAt)}
                            </small>
                          </div>
                          <small className="text-muted">{notification.message}</small>
                          {!notification.isRead && (
                            <div className="mt-1">
                              <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>New</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  </li>
                ))
              )}
              {notifications.length > 10 && (
                <>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <div className="dropdown-item text-center text-muted">
                      <small>And {notifications.length - 10} more...</small>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-link text-dark d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="avatar bg-primary text-white rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-start d-none d-md-block">
                <div className="fw-bold">{user?.name}</div>
                <small className="text-muted">{user?.role}</small>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" style={{ minWidth: '200px' }}>
              <li>
                <div className="dropdown-header">
                  <div className="fw-bold">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Link className="dropdown-item py-2" to={`/${user?.role}/profile`}>
                  <i className="bi bi-person me-2"></i>Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to={`/${user?.role}/settings`}>
                  <i className="bi bi-gear me-2"></i>Settings
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
