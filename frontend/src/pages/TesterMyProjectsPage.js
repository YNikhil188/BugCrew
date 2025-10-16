import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import API_BASE_URL from '../config/api';

const TesterMyProjectsPage = () => {
  const { user } = useContext(AuthContext);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const res = await axios.get('${API_BASE_URL}/api/projects');
      
      // Filter projects where user is a team member
      const userProjects = res.data.filter(p => {
        if (!p.team || !Array.isArray(p.team)) return false;
        return p.team.some(member => {
          const memberId = member.user?._id || member.user || member._id;
          return memberId === user._id || memberId?.toString() === user._id?.toString();
        });
      });
      
      setMyProjects(userProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my projects:', error);
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="tester" />
        <div className="flex-grow-1">
          <Navbar user={user} />
          <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar role="tester" />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>
                <i className="bi bi-folder-fill me-3 text-success"></i>
                My Projects
              </h1>
              <div className="d-flex gap-2">
                <span className="badge bg-success fs-6">{myProjects.length} Assigned Projects</span>
              </div>
            </div>

            {/* Info Alert */}
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>My Projects:</strong> Projects where you are assigned as a team member for testing.
            </div>

            {myProjects.length === 0 ? (
              <div className="stat-card text-center py-5">
                <i className="bi bi-folder-fill fs-1 text-muted mb-3"></i>
                <h4 className="text-muted">No Projects Assigned</h4>
                <p className="text-muted">You haven't been assigned to any projects yet for testing.</p>
              </div>
            ) : (
              <div className="row g-4">
                {myProjects.map((project, index) => (
                  <div key={project._id} className="col-md-6 col-lg-4">
                    <motion.div
                      className="stat-card h-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                    >
                      {/* Project Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="mb-1">{project.name}</h5>
                          <small className="text-muted">
                            <i className="bi bi-person me-1"></i>
                            Manager: {project.manager?.name || 'N/A'}
                          </small>
                        </div>
                        <span className={`badge bg-${
                          project.status === 'completed' ? 'success' :
                          project.status === 'in-progress' ? 'primary' :
                          project.status === 'planning' ? 'warning' : 'secondary'
                        }`}>
                          {project.status || 'Active'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                        {project.description || 'No description provided'}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="text-muted fw-bold">{project.progress || 0}%</small>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <motion.div
                            className={`progress-bar bg-${getProgressColor(project.progress || 0)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress || 0}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          ></motion.div>
                        </div>
                      </div>

                      {/* Team Info */}
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-people me-1"></i>
                          Team: {project.team?.length || 0} member(s)
                        </small>
                      </div>

                      {/* Deadline */}
                      {project.deadline && (
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="bi bi-calendar-event me-1"></i>
                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </small>
                        </div>
                      )}

                      {/* Priority Badge */}
                      <div className="d-flex gap-2">
                        <span className={`badge bg-${
                          project.priority === 'critical' ? 'danger' :
                          project.priority === 'high' ? 'warning' :
                          project.priority === 'medium' ? 'info' : 'success'
                        }`}>
                          {project.priority || 'Normal'} Priority
                        </span>
                        <span className="badge bg-info">
                          <i className="bi bi-check2-square me-1"></i>
                          Tester
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {myProjects.length > 0 && (
              <motion.div
                className="row g-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="col-md-3">
                  <div className="stat-card text-center">
                    <i className="bi bi-folder-fill fs-2 text-success mb-2"></i>
                    <h3>{myProjects.length}</h3>
                    <p className="text-muted mb-0">Total Assigned</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card text-center">
                    <i className="bi bi-check-circle-fill fs-2 text-success mb-2"></i>
                    <h3>{myProjects.filter(p => p.status === 'completed').length}</h3>
                    <p className="text-muted mb-0">Completed</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card text-center">
                    <i className="bi bi-clock-fill fs-2 text-warning mb-2"></i>
                    <h3>{myProjects.filter(p => p.status === 'in-progress').length}</h3>
                    <p className="text-muted mb-0">In Progress</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card text-center">
                    <i className="bi bi-lightbulb-fill fs-2 text-info mb-2"></i>
                    <h3>{myProjects.filter(p => p.status === 'planning').length}</h3>
                    <p className="text-muted mb-0">Planning</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TesterMyProjectsPage;
