import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = {
    admin: [
      { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/admin/users', icon: 'bi-people', label: 'Users' },
      { path: '/admin/projects', icon: 'bi-folder', label: 'Projects' },
      { path: '/admin/bugs', icon: 'bi-bug', label: 'Bugs' },
      { path: '/admin/reports', icon: 'bi-bar-chart', label: 'Reports' },
      { path: '/admin/chat', icon: 'bi-chat-dots', label: 'Messages' },
      { type: 'divider' },
      { path: '/admin/profile', icon: 'bi-person', label: 'Profile' },
      { path: '/admin/settings', icon: 'bi-gear', label: 'Settings' },
      { type: 'logout', icon: 'bi-box-arrow-right', label: 'Logout' }
    ],
    manager: [
      { path: '/manager/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/manager/projects', icon: 'bi-folder', label: 'Projects' },
      { path: '/manager/team', icon: 'bi-people', label: 'Team' },
      { path: '/manager/bugs', icon: 'bi-bug', label: 'Bugs' },
      { path: '/manager/reports', icon: 'bi-bar-chart', label: 'Reports' },
      { path: '/manager/chat', icon: 'bi-chat-dots', label: 'Messages' },
      { type: 'divider' },
      { path: '/manager/profile', icon: 'bi-person', label: 'Profile' },
      { path: '/manager/settings', icon: 'bi-gear', label: 'Settings' },
      { type: 'logout', icon: 'bi-box-arrow-right', label: 'Logout' }
    ],
    developer: [
      { path: '/developer/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/developer/bugs', icon: 'bi-bug', label: 'My Bugs' },
      { path: '/developer/projects', icon: 'bi-folder2', label: 'Projects' },
      { path: '/developer/myprojects', icon: 'bi-folder-fill', label: 'My Projects' },
      { path: '/developer/chat', icon: 'bi-chat-dots', label: 'Messages' },
      { type: 'divider' },
      { path: '/developer/profile', icon: 'bi-person', label: 'Profile' },
      { path: '/developer/settings', icon: 'bi-gear', label: 'Settings' },
      { type: 'logout', icon: 'bi-box-arrow-right', label: 'Logout' }
    ],
    tester: [
      { path: '/tester/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/tester/bugs', icon: 'bi-bug', label: 'Report Bug' },
      { path: '/tester/mybugs', icon: 'bi-list-check', label: 'My Reports' },
      { path: '/tester/projects', icon: 'bi-folder2', label: 'Projects' },
      { path: '/tester/myprojects', icon: 'bi-folder-fill', label: 'My Projects' },
      { path: '/tester/chat', icon: 'bi-chat-dots', label: 'Messages' },
      { type: 'divider' },
      { path: '/tester/profile', icon: 'bi-person', label: 'Profile' },
      { path: '/tester/settings', icon: 'bi-gear', label: 'Settings' },
      { type: 'logout', icon: 'bi-box-arrow-right', label: 'Logout' }
    ]
  };

  const items = menuItems[role] || [];

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -250 }}
      animate={{ 
        x: 0,
        width: isCollapsed ? '80px' : '250px'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="p-4 position-relative">
        <motion.button
          className="btn btn-link text-white position-absolute"
          style={{ top: '10px', right: '10px', zIndex: 1000 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className={`bi bi-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </motion.button>
        
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              className="sidebar-logo-container mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src="/images/bugcrew-logo.png" 
                alt="BugCrew" 
                className="sidebar-logo"
              />
            </motion.div>
          ) : (
            <motion.div
              className="sidebar-logo-collapsed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img 
                src="/images/bugcrew-logo.png" 
                alt="BugCrew" 
                className="sidebar-logo-small"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <nav className="nav flex-column">
          {items.map((item, index) => (
            <motion.div
              key={item.path || `divider-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.type === 'divider' ? (
                <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              ) : item.type === 'logout' ? (
                <button
                  onClick={handleLogout}
                  className="sidebar-link w-100 border-0 text-start"
                  style={{ background: 'transparent', color: '#ff6b6b' }}
                  title={item.label}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  title={item.label}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              )}
            </motion.div>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
