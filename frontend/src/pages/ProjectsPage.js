import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ProjectsPage = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    progress: 0
  });
  const [teamMember, setTeamMember] = useState({ userId: '', role: 'developer' });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/projects`);
      setProjects(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data.filter(u => u.role === 'developer' || u.role === 'tester'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`${API_BASE_URL}/api/projects/${editingProject._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/projects`, formData);
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      progress: project.progress
    });
    setShowModal(true);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`);
        fetchProjects();
      } catch (error) {
        alert('Error deleting project');
      }
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/projects/${selectedProject._id}/team`, teamMember);
      setShowTeamModal(false);
      setTeamMember({ userId: '', role: 'developer' });
      fetchProjects();
    } catch (error) {
      alert('Error adding team member');
    }
  };

  const handleRemoveTeamMember = async (projectId, userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/projects/${projectId}/team/${userId}`);
      fetchProjects();
    } catch (error) {
      alert('Error removing team member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      progress: 0
    });
    setEditingProject(null);
  };

  const getStatusBadge = (status) => {
    const colors = {
      planning: 'secondary',
      'in-progress': 'primary',
      testing: 'warning',
      completed: 'success',
      'on-hold': 'danger'
    };
    return <span className={`badge bg-${colors[status]}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const colors = { low: 'success', medium: 'warning', high: 'danger', critical: 'dark' };
    return <span className={`badge bg-${colors[priority]}`}>{priority}</span>;
  };

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>
                <i className="bi bi-folder me-3"></i>
                Projects
              </h1>
              {user?.role === 'manager' && (
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Project
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="row g-4">
                {projects.map((project, index) => (
                  <div key={project._id} className="col-md-6 col-lg-4">
                    <motion.div
                      className="stat-card card-hover"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="mb-0">{project.name}</h5>
                        {getPriorityBadge(project.priority)}
                      </div>
                      <p className="text-muted mb-3">{project.description}</p>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{project.progress}%</small>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>{getStatusBadge(project.status)}</div>
                        <small className="text-muted">
                          <i className="bi bi-people me-1"></i>
                          {project.team?.length || 0} members
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        {user?.role === 'manager' && (
                          <>
                            <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => handleEdit(project)}>
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button className="btn btn-sm btn-outline-success" onClick={() => { setSelectedProject(project); setShowTeamModal(true); }}>
                              <i className="bi bi-person-plus"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(project._id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <button className="btn btn-sm btn-outline-secondary flex-grow-1" disabled>
                            <i className="bi bi-eye"></i> View Only
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="modal-dialog modal-dialog-centered" 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editingProject ? 'Edit Project' : 'Create Project'}</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Project Name *</label>
                      <input type="text" className="form-control" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea className="form-control" rows="3" value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                          <option value="planning">Planning</option>
                          <option value="in-progress">In Progress</option>
                          <option value="testing">Testing</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-control" value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-control" value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Progress: {formData.progress}%</label>
                      <input type="range" className="form-range" min="0" max="100" value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingProject ? 'Update' : 'Create'} Project
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Modal */}
      <AnimatePresence>
        {showTeamModal && selectedProject && (
          <motion.div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTeamModal(false)}>
            <motion.div className="modal-dialog modal-dialog-centered"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Manage Team - {selectedProject.name}</h5>
                  <button className="btn-close" onClick={() => setShowTeamModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddTeamMember} className="mb-3">
                    <div className="row">
                      <div className="col-8">
                        <select className="form-select" value={teamMember.userId}
                          onChange={(e) => setTeamMember({ ...teamMember, userId: e.target.value })} required>
                          <option value="">Select User</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-4">
                        <button type="submit" className="btn btn-primary w-100">
                          <i className="bi bi-plus"></i> Add
                        </button>
                      </div>
                    </div>
                  </form>
                  <h6>Current Team:</h6>
                  <div className="list-group">
                    {selectedProject.team?.map(member => (
                      <div key={member.user._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{member.user.name}</strong>
                          <span className="badge bg-secondary ms-2">{member.role}</span>
                        </div>
                        <button className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveTeamMember(selectedProject._id, member.user._id)}>
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
