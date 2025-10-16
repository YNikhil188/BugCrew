import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = ({ role }) => {
  const { logout } = useContext(AuthContext);
  const { 
    isMobileOpen, 
    isCollapsed, 
    toggleCollapse, 
    closeMobileMenu 
  } = useSidebar();
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
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      console.log('Mobile check:', { windowWidth: window.innerWidth, isMobile: mobile });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Debug logging
  console.log('Sidebar render:', { isMobile, isMobileOpen, isCollapsed, role });

  // Close mobile menu when clicking on a link
  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  // Add effect to handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar-mobile-overlay d-md-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="sidebar"
        initial={false}
        animate={{ 
          x: isMobile ? (isMobileOpen ? 0 : -250) : 0,
          width: isCollapsed && !isMobile ? '80px' : '250px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1050 : 'auto',
          left: isMobile ? 0 : 'auto', // Ensure left is 0 for mobile
          top: isMobile ? 0 : 'auto',
          height: isMobile ? '100vh' : 'auto'
        }}
      >
      <div className="p-4 position-relative">
        {/* Desktop collapse button */}
        {!isMobile && (
          <motion.button
            className="btn btn-link text-white position-absolute"
            style={{ top: '10px', right: '10px', zIndex: 1000 }}
            onClick={toggleCollapse}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className={`bi bi-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
          </motion.button>
        )}
        
        {/* Mobile close button */}
        {isMobile && (
          <motion.button
            className="btn btn-link text-white position-absolute"
            style={{ top: '10px', right: '10px', zIndex: 1000 }}
            onClick={closeMobileMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className="bi bi-x-lg"></i>
          </motion.button>
        )}
        
        <AnimatePresence>
          {(!isCollapsed || isMobile) ? (
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
                    {(!isCollapsed || isMobile) && (
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
                  onClick={handleLinkClick}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <AnimatePresence>
                    {(!isCollapsed || isMobile) && (
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
    </>
  );
};

export default Sidebar;
