import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const slides = [
  {
    icon: '🐛',
    title: 'Track Bugs Efficiently',
    description: 'Identify, report, and resolve bugs faster with our intuitive bug tracking system',
    color: '#667eea'
  },
  {
    icon: '📋',
    title: 'Manage Projects with Ease',
    description: 'Organize your projects, assign tasks, and monitor progress in real-time',
    color: '#764ba2'
  },
  {
    icon: '👥',
    title: 'Collaborate with Your Team',
    description: 'Work together seamlessly with role-based access and real-time notifications',
    color: '#f093fb'
  },
  {
    icon: '📈',
    title: 'Boost Productivity',
    description: 'Get insights with powerful analytics and detailed reporting tools',
    color: '#f5576c'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Logo Section */}
        <motion.div
          className="landing-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="logo-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="/images/bugcrew-logo.png" 
              alt="BugCrew Logo" 
              className="logo-image"
            />
          </motion.div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="btn btn-glow btn-lg"
            onClick={goToLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-rocket-takeoff me-2"></i>
            Get Started
          </motion.button>
        </motion.div>

        {/* Scrolling Features */}
        <div className="features-carousel">
          <motion.div 
            className="features-track"
            animate={{ x: [0, -1000] }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...slides, ...slides].map((slide, index) => (
              <div key={index} className="feature-card">
                <div className="feature-card-icon">{slide.icon}</div>
                <h3 className="feature-card-title">{slide.title}</h3>
                <p className="feature-card-description">{slide.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
