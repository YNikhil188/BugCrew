import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import API_BASE_URL from '../config/api';

const TesterDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bugsRes, projectsRes] = await Promise.all([
        axios.get('${API_BASE_URL}/api/bugs'),
        axios.get('${API_BASE_URL}/api/projects')
      ]);
      // Filter to only show bugs reported by this tester
      setBugs(bugsRes.data.filter(b => b.reporter?._id === user._id));
      setProjects(projectsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchComments = async (bugId) => {
    try {
      const res = await axios.get(`/api/comments/bug/${bugId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
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

      await axios.post('${API_BASE_URL}/api/bugs', data);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating bug');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`/api/comments/bug/${selectedBug._id}`, { content: newComment });
      setNewComment('');
      fetchComments(selectedBug._id);
    } catch (error) {
      alert('Error adding comment');
    }
  };

  const openBugDetails = (bug) => {
    setSelectedBug(bug);
    fetchComments(bug._id);
    setShowComments(true);
  };

  const handleVerify = async (bugId, action) => {
    if (action === 'close' && !window.confirm('Confirm that the bug is fixed and close it?')) {
      return;
    }
    if (action === 'reopen' && !window.confirm('Reopen this bug because the fix does not work?')) {
      return;
    }
    
    try {
      await axios.put(`/api/bugs/${bugId}/verify`, { action });
      fetchData();
      if (showComments) setShowComments(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error verifying bug');
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
  };

  const getPriorityBadge = (priority) => {
    return <span className={`badge priority-${priority}`}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: 'info',
      'in-progress': 'warning',
      resolved: 'success',
      closed: 'secondary',
      reopened: 'danger'
    };
    return <span className={`badge bg-${colors[status]}`}>{status}</span>;
  };

  // Filter bugs based on status and priority
  const filteredBugs = bugs.filter(bug => {
    const statusMatch = filterStatus === 'all' || bug.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || bug.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="tester" />
        <div className="flex-grow-1">
          <Navbar user={user} />
          <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
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
                <i className="bi bi-bug me-3"></i>
                Tester Dashboard
              </h1>
              <motion.button 
                className="btn btn-danger btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Report New Bug
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              {[
                { title: 'Reported', count: bugs.length, icon: 'bi-bug-fill', color: '#dc3545' },
                { title: 'Open', count: bugs.filter(b => b.status === 'open').length, icon: 'bi-folder2-open', color: '#17a2b8' },
                { title: 'Resolved', count: bugs.filter(b => b.status === 'resolved').length, icon: 'bi-check-circle-fill', color: '#28a745' }
              ].map((stat, i) => (
                <div key={i} className="col-md-4">
                  <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted mb-2">{stat.title}</p>
                        <h2 style={{ color: stat.color }}>{stat.count}</h2>
                      </div>
                      <i className={`bi ${stat.icon} fs-1`} style={{ color: stat.color }}></i>
                    </div>
                  </motion.div>
                </div>
              ))}</div>

            {/* Filters */}
            <div className="stat-card mb-4">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <h5 className="mb-0">
                    <i className="bi bi-funnel me-2"></i>
                    Filters
                  </h5>
                </div>
                <div className="col-md-4">
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select 
                    className="form-select"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* My Bug Reports */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                <i className="bi bi-clipboard-data me-2"></i>
                My Bug Reports
              </h4>
              <span className="badge bg-danger fs-6">{filteredBugs.length} bugs</span>
            </div>
            
            {filteredBugs.length === 0 ? (
              <motion.div 
                className="stat-card text-center py-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                <p className="text-muted">No bugs found matching your filters</p>
                <button className="btn btn-danger" onClick={() => { resetForm(); setShowModal(true); }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Report Your First Bug
                </button>
              </motion.div>
            ) : (
              <div className="row g-3">
                {filteredBugs.map((bug, index) => (
                <div key={bug._id} className="col-md-6 col-lg-4">
                  <motion.div
                    className="stat-card card-hover"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openBugDetails(bug)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">{bug.title}</h6>
                      {getPriorityBadge(bug.priority)}
                    </div>
                    <p className="text-muted small mb-3">{bug.description?.substring(0, 80)}...</p>
                    <div className="d-flex justify-content-between align-items-center">
                      {getStatusBadge(bug.status)}
                      <small className="text-muted">{bug.project?.name}</small>
                    </div>
                    {bug.assignedTo && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="bi bi-person-check me-1"></i>
                          Assigned to: {bug.assignedTo.name}
                        </small>
                      </div>
                    )}
                    {bug.status === 'resolved' && (
                      <motion.div 
                        className="mt-3 d-flex gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <button 
                          className="btn btn-sm btn-success flex-grow-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(bug._id, 'close');
                          }}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Verify & Close
                        </button>
                        <button 
                          className="btn btn-sm btn-warning flex-grow-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(bug._id, 'reopen');
                          }}
                        >
                          <i className="bi bi-arrow-counterclockwise me-1"></i>
                          Reopen
                        </button>
                      </motion.div>
                    )}
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Create Bug Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="modal-dialog modal-dialog-centered modal-lg"
              initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5><i className="bi bi-bug-fill me-2"></i>Report New Bug</h5>
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
                        <label className="form-label">Priority *</label>
                        <select className="form-select" value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🟠 High</option>
                          <option value="critical">🔴 Critical</option>
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
                    <div className="mb-3">
                      <label className="form-label">Screenshots</label>
                      <input type="file" className="form-control" multiple accept="image/*"
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
                      <small className="text-muted">You can upload multiple screenshots</small>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <span className="badge bg-success">{selectedFiles.length} file(s) selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger">
                      <i className="bi bi-send me-2"></i>
                      Submit Bug Report
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && selectedBug && (
          <motion.div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowComments(false)}>
            <motion.div className="modal-dialog modal-dialog-centered modal-lg"
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <div>
                    <h5>{selectedBug.title}</h5>
                    <small className="text-muted">{selectedBug.project?.name}</small>
                  </div>
                  <button className="btn-close" onClick={() => setShowComments(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Status:</strong> {getStatusBadge(selectedBug.status)}
                    <span className="ms-3"><strong>Priority:</strong> {getPriorityBadge(selectedBug.priority)}</span>
                  </div>
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="text-muted">{selectedBug.description}</p>
                  </div>
                  
                  <hr />
                  <h6 className="mb-3">
                    <i className="bi bi-chat-dots me-2"></i>
                    Comments ({comments.length})
                  </h6>
                  
                  <div className="comments-list mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment._id}
                        className="card mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar bg-primary text-white rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                {comment.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong>{comment.user?.name}</strong>
                            </div>
                            <small className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
                          </div>
                          <p className="mb-0">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))}</div>

                  <form onSubmit={handleAddComment}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-send"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TesterDashboard;
