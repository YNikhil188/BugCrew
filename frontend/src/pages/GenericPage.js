import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

const GenericPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes('reports')) return { title: 'Reports', icon: 'bi-bar-chart', desc: 'View analytics and generate reports' };
    if (path.includes('settings')) return { title: 'Settings', icon: 'bi-gear', desc: 'Configure your preferences' };
    if (path.includes('team')) return { title: 'Team', icon: 'bi-people', desc: 'Manage your team members' };
    if (path.includes('profile')) return { title: 'Profile', icon: 'bi-person', desc: 'View and edit your profile' };
    return { title: 'Page', icon: 'bi-file-earmark', desc: 'Content coming soon' };
  };

  const { title, icon, desc } = getPageInfo();

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4">
              <i className={`bi ${icon} me-3`}></i>
              {title}
            </h1>
            <div className="stat-card">
              <p className="mb-3">{desc}</p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                This page is under development. More features coming soon!
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;
