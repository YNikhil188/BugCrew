import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const BugsPage = () => {
  const { user } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
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
  const [assignForm, setAssignForm] = useState({
    userId: '',
    sendEmail: true
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBugs();
    fetchProjects();
    if (user?.role === 'manager') {
      fetchUsers();
    }
  }, [user]);

  const fetchBugs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bugs`);
      setBugs(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bugs:', error);
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/projects`);
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      // Only fetch developers for bug assignment (testers cannot be assigned bugs)
      setUsers(res.data.filter(u => u.role === 'developer'));
    } catch (error) {
      console.error('Error fetching users:', error);
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
        await axios.put(`${API_BASE_URL}/api/bugs/${editingBug._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/bugs`, data);
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
        await axios.delete(`${API_BASE_URL}/api/bugs/${bugId}`);
        fetchBugs();
      } catch (error) {
        alert('Error deleting bug');
      }
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/bugs/${bugId}`, { status: newStatus });
      fetchBugs();
    } catch (error) {
      alert('Error updating bug status');
    }
  };

  const handleAssignBug = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/bugs/${selectedBug._id}/assign`, {
        userId: assignForm.userId,
        sendEmail: assignForm.sendEmail
      });
      setShowAssignModal(false);
      setAssignForm({ userId: '', sendEmail: true });
      fetchBugs();
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning bug');
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
  
  const openBugDetails = (bug) => {
    setSelectedBug(bug);
    setShowDetailsModal(true);
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
              {user?.role === 'tester' && (
                <button className="btn btn-danger" onClick={() => { resetForm(); setShowModal(true); }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Report New Bug
                </button>
              )}
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
                            {user?.role === 'developer' && (
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
                            {user?.role === 'admin' && (
                              <span className="badge bg-secondary">View Only</span>
                            )}
                            {user?.role === 'manager' && (
                              <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => { setSelectedBug(bug); setShowAssignModal(true); }}
                              >
                                <i className="bi bi-person-plus me-1"></i>Assign
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-info me-1"
                              onClick={() => openBugDetails(bug)}
                            >
                              <i className="bi bi-eye"></i> Details
                            </button>
                            {user?.role === 'developer' && (
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(bug)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            {user?.role === 'tester' && bug.screenshots?.length > 0 && (
                              <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => openBugDetails(bug)}
                              >
                                <i className="bi bi-paperclip"></i> Attachments
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

      {/* Assign Bug Modal */}
      <AnimatePresence>
        {showAssignModal && selectedBug && (
          <motion.div 
            className="modal show d-block" 
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div 
              className="modal-dialog modal-dialog-centered"
              initial={{ scale: 0.7, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: -50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="modal-header bg-warning text-dark">
                  <h5><i className="bi bi-bug-fill me-2"></i>Assign Bug to Team Member</h5>
                  <button className="btn-close" onClick={() => setShowAssignModal(false)}></button>
                </div>
                <form onSubmit={handleAssignBug}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Bug:</strong> {selectedBug.title}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Assign To *</label>
                      <select 
                        className="form-select"
                        value={assignForm.userId}
                        onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                        required
                      >
                        <option value="">Select Developer...</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>
                            {u.name} - {u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="sendBugEmail"
                        checked={assignForm.sendEmail}
                        onChange={(e) => setAssignForm({ ...assignForm, sendEmail: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="sendBugEmail">
                        <i className="bi bi-envelope me-1"></i>
                        Send email notification to assignee
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-warning">
                      <i className="bi bi-check-circle me-2"></i>
                      Assign Bug
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bug Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedBug && (
          <motion.div 
            className="modal show d-block" 
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div 
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              initial={{ scale: 0.8, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <div>
                    <h5>{selectedBug.title}</h5>
                    <small className="text-muted">{selectedBug.project?.name}</small>
                  </div>
                  <button className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="text-muted">{selectedBug.description}</p>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Priority:</strong> <span className={`badge priority-${selectedBug.priority} ms-2`}>{selectedBug.priority}</span>
                    </div>
                    <div className="col-md-6">
                      <strong>Status:</strong> {getStatusBadge(selectedBug.status)}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Reporter:</strong> {selectedBug.reporter?.name}
                    </div>
                    <div className="col-md-6">
                      <strong>Assigned To:</strong> {selectedBug.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>
                  
                  {selectedBug.stepsToReproduce && (
                    <div className="mb-3">
                      <strong>Steps to Reproduce:</strong>
                      <p className="text-muted">{selectedBug.stepsToReproduce}</p>
                    </div>
                  )}
                  
                  {selectedBug.environment && (
                    <div className="mb-3">
                      <strong>Environment:</strong>
                      <p className="text-muted">{selectedBug.environment}</p>
                    </div>
                  )}
                  
                  {selectedBug.screenshots && selectedBug.screenshots.length > 0 && (
                    <div className="mb-3">
                      <strong>
                        <i className="bi bi-paperclip me-2"></i>
                        Attachments ({selectedBug.screenshots.length})
                      </strong>
                      <div className="row g-2 mt-2">
                        {selectedBug.screenshots.map((screenshot, index) => (
                          <div key={index} className="col-md-3">
                            <div 
                              className="card card-hover"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedImage(`${API_BASE_URL}/${screenshot}`);
                                setShowImageModal(true);
                              }}
                            >
                              <img 
                                src={`${API_BASE_URL}/${screenshot}`} 
                                alt={`Screenshot ${index + 1}`}
                                className="card-img-top"
                                style={{ 
                                  height: '80px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zNS41IDQwQzM3LjE1NjkgNDAgMzguNSAzOC42NTY5IDM4LjUgMzdDMzguNSAzNS4zNDMxIDM3LjE1NjkgMzQgMzUuNSAzNEMzMy44NDMxIDM0IDMyLjUgMzUuMzQzMSAzMi41IDM3QzMyLjUgMzguNjU2OSAzMy44NDMxIDQwIDM1LjUgNDBaIiBmaWxsPSIjQzVDNUM1Ii8+CjxwYXRoIGQ9Ik0yNS41IDY2SDc0LjVWNTBIMjUuNVY2NloiIGZpbGw9IiNFNUU1RTUiLz4KPHA+SW1hZ2UgTm90IEZvdW5kPC9wPgo8L3N2Zz4K';
                                }}
                              />
                              <div className="card-body p-2">
                                <small className="text-muted">Screenshot {index + 1}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div 
            className="modal show d-block" 
            style={{ background: 'rgba(0,0,0,0.8)', zIndex: 2000 }}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <motion.div 
                className="modal-content bg-transparent border-0"
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header border-0 pb-0">
                  <h5 className="text-white">Screenshot</h5>
                  <button 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowImageModal(false)}
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <img 
                    src={selectedImage} 
                    alt="Screenshot" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '70vh', maxWidth: '100%' }}
                  />
                </div>
                <div className="modal-footer border-0 pt-0">
                  <a 
                    href={selectedImage} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-outline-light"
                  >
                    <i className="bi bi-download me-2"></i>
                    Download
                  </a>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowImageModal(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BugsPage;
