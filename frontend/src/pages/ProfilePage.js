import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${user._id}`, formData);
      alert('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const activities = [
    { icon: 'bi-bug', text: 'Reported bug #1234', time: '2 hours ago', color: 'danger' },
    { icon: 'bi-check-circle', text: 'Resolved bug #1233', time: '5 hours ago', color: 'success' },
    { icon: 'bi-folder', text: 'Assigned to Project Alpha', time: '1 day ago', color: 'primary' },
    { icon: 'bi-chat', text: 'Commented on bug #1232', time: '2 days ago', color: 'info' }
  ];

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4">
              <i className="bi bi-person me-3"></i>
              Profile
            </h1>

            <div className="row g-4">
              {/* Profile Card */}
              <div className="col-md-4">
                <motion.div
                  className="stat-card text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="avatar bg-primary text-white rounded-circle mx-auto mb-3"
                    style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </motion.div>
                  <h3>{user?.name}</h3>
                  <p className="text-muted">{user?.email}</p>
                  <span className={`badge bg-${user?.role === 'admin' ? 'danger' : user?.role === 'manager' ? 'primary' : user?.role === 'developer' ? 'success' : 'warning'} mb-3`}>
                    {user?.role}
                  </span>
                  
                  <div className="d-grid gap-2 mt-4">
                    <motion.button
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Info & Activity */}
              <div className="col-md-8">
                {/* Info Card */}
                <motion.div
                  className="stat-card mb-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h5 className="mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Information
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>Name:</strong>
                      <p className="text-muted">{user?.name}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Email:</strong>
                      <p className="text-muted">{user?.email}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Role:</strong>
                      <p className="text-muted text-capitalize">{user?.role}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Department:</strong>
                      <p className="text-muted">{user?.department || 'Not specified'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Phone:</strong>
                      <p className="text-muted">{user?.phone || 'Not specified'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Status:</strong>
                      <p className="text-muted">
                        <span className={`badge ${user?.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Activity Timeline */}
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h5 className="mb-3">
                    <i className="bi bi-clock-history me-2"></i>
                    Recent Activity
                  </h5>
                  <div className="activity-timeline">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="d-flex align-items-start mb-3 pb-3 border-bottom"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className={`avatar bg-${activity.color} text-white rounded-circle me-3`}
                          style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className={`bi ${activity.icon}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1">{activity.text}</p>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="modal show d-block"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="modal-dialog modal-dialog-centered"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5>
                    <i className="bi bi-pencil me-2"></i>
                    Edit Profile
                  </h5>
                  <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-2"></i>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
