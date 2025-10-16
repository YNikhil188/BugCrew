import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';

const BugsPage = () => {
  const { user } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    severity: 'major',
    type: 'bug',
    stepsToReproduce: '',
    environment: ''
  });

  useEffect(() => {
    fetchBugs();
    fetchProjects();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await axios.get('/api/bugs');
      setBugs(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bugs:', error);
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      selectedFiles.forEach(file => {
        data.append('screenshots', file);
      });

      if (editingBug) {
        await axios.put(`/api/bugs/${editingBug._id}`, formData);
      } else {
        await axios.post('/api/bugs', data);
      }
      setShowModal(false);
      resetForm();
      fetchBugs();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving bug');
    }
  };

  const handleEdit = (bug) => {
    setEditingBug(bug);
    setFormData({
      title: bug.title,
      description: bug.description,
      project: bug.project._id || bug.project,
      priority: bug.priority,
      severity: bug.severity,
      type: bug.type,
      stepsToReproduce: bug.stepsToReproduce || '',
      environment: bug.environment || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (bugId) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await axios.delete(`/api/bugs/${bugId}`);
        fetchBugs();
      } catch (error) {
        alert('Error deleting bug');
      }
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await axios.put(`/api/bugs/${bugId}`, { status: newStatus });
      fetchBugs();
    } catch (error) {
      alert('Error updating bug status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project: '',
      priority: 'medium',
      severity: 'major',
      type: 'bug',
      stepsToReproduce: '',
      environment: ''
    });
    setSelectedFiles([]);
    setEditingBug(null);
  };

  const getStatusBadge = (status) => {
    const config = {
      open: { color: 'info', icon: 'bi-folder2-open' },
      'in-progress': { color: 'warning', icon: 'bi-arrow-repeat' },
      resolved: { color: 'success', icon: 'bi-check-circle' },
      closed: { color: 'secondary', icon: 'bi-x-circle' },
      reopened: { color: 'danger', icon: 'bi-arrow-counterclockwise' }
    };
    const { color, icon } = config[status] || config.open;
    return (
      <span className={`badge bg-${color}`}>
        <i className={`bi ${icon} me-1`}></i>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = { low: 'success', medium: 'warning', high: 'orange', critical: 'danger' };
    return <span className={`badge priority-${priority}`}>{priority}</span>;
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
                <i className="bi bi-bug me-3"></i>
                Bug Tracking
              </h1>
              <button className="btn btn-danger" onClick={() => { resetForm(); setShowModal(true); }}>
                <i className="bi bi-plus-circle me-2"></i>
                Report New Bug
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
              </div>
            ) : (
              <div className="row g-4">
                {bugs.map((bug, index) => (
                  <div key={bug._id} className="col-12">
                    <motion.div
                      className="stat-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="row">
                        <div className="col-md-8">
                          <div className="d-flex align-items-start gap-3 mb-3">
                            <i className="bi bi-bug-fill fs-3 text-danger"></i>
                            <div className="flex-grow-1">
                              <h5 className="mb-2">{bug.title}</h5>
                              <p className="text-muted mb-2">{bug.description}</p>
                              <div className="d-flex gap-2 flex-wrap">
                                {getStatusBadge(bug.status)}
                                {getPriorityBadge(bug.priority)}
                                <span className="badge bg-light text-dark">{bug.type}</span>
                                <span className="badge bg-secondary">{bug.project?.name || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex flex-column gap-2">
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              Reporter: {bug.reporter?.name}
                            </small>
                            {bug.assignedTo && (
                              <small className="text-muted">
                                <i className="bi bi-person-check me-1"></i>
                                Assigned: {bug.assignedTo.name}
                              </small>
                            )}
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {new Date(bug.createdAt).toLocaleDateString()}
                            </small>
                            {bug.screenshots?.length > 0 && (
                              <small className="text-muted">
                                <i className="bi bi-image me-1"></i>
                                {bug.screenshots.length} attachment(s)
                              </small>
                            )}
                          </div>
                          <div className="mt-3 d-flex gap-2">
                            {(user?.role === 'admin' || user?.role === 'developer') && (
                              <select 
                                className="form-select form-select-sm"
                                value={bug.status}
                                onChange={(e) => handleStatusChange(bug._id, e.target.value)}
                              >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                                <option value="reopened">Reopened</option>
                              </select>
                            )}
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(bug)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            {user?.role === 'admin' && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(bug._id)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="modal-dialog modal-dialog-centered modal-lg"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5>{editingBug ? 'Edit Bug' : 'Report New Bug'}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Bug Title *</label>
                      <input type="text" className="form-control" value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea className="form-control" rows="3" value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Project *</label>
                        <select className="form-select" value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })} required>
                          <option value="">Select Project</option>
                          {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Type</label>
                        <select className="form-select" value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                          <option value="bug">Bug</option>
                          <option value="feature">Feature</option>
                          <option value="enhancement">Enhancement</option>
                          <option value="task">Task</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
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
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Severity</label>
                        <select className="form-select" value={formData.severity}
                          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}>
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                          <option value="critical">Critical</option>
                          <option value="blocker">Blocker</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Steps to Reproduce</label>
                      <textarea className="form-control" rows="3" value={formData.stepsToReproduce}
                        onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Environment</label>
                      <input type="text" className="form-control" value={formData.environment}
                        onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                        placeholder="e.g. Windows 11, Chrome 120" />
                    </div>
                    {!editingBug && (
                      <div className="mb-3">
                        <label className="form-label">Screenshots</label>
                        <input type="file" className="form-control" multiple accept="image/*"
                          onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
                        <small className="text-muted">You can upload multiple images</small>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger">
                      {editingBug ? 'Update Bug' : 'Report Bug'}
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

export default BugsPage;
