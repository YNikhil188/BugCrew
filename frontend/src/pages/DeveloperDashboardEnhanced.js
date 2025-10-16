import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import API_BASE_URL from '../config/api';

const DeveloperDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const columns = {
    open: { title: 'To Do', color: 'info', bugs: [] },
    'in-progress': { title: 'In Progress', color: 'warning', bugs: [] },
    resolved: { title: 'Done', color: 'success', bugs: [] }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bugsRes, projectsRes] = await Promise.all([
        axios.get('${API_BASE_URL}/api/bugs'),
        axios.get('${API_BASE_URL}/api/projects')
      ]);
      setBugs(bugsRes.data.filter(b => b.assignedTo?._id === user._id));
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await axios.put(`/api/bugs/${bugId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert('Error updating bug status');
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

  const organizedBugs = bugs.reduce((acc, bug) => {
    const status = bug.status === 'closed' ? 'resolved' : bug.status;
    if (acc[status]) {
      acc[status].bugs.push(bug);
    }
    return acc;
  }, { ...columns });

  return (
    <div className="d-flex">
      <Sidebar role="developer" />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>
                <i className="bi bi-code-slash me-3"></i>
                Developer Dashboard
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              {[
                { title: 'Assigned', count: bugs.length, icon: 'bi-bug', color: '#667eea' },
                { title: 'In Progress', count: bugs.filter(b => b.status === 'in-progress').length, icon: 'bi-arrow-repeat', color: '#ffc107' },
                { title: 'Resolved', count: bugs.filter(b => b.status === 'resolved').length, icon: 'bi-check-circle', color: '#28a745' }
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
              ))}
            </div>

            {/* Kanban Board */}
            <h4 className="mb-3">
              <i className="bi bi-kanban me-2"></i>
              Kanban Board
            </h4>
            <div className="row g-3">
              {Object.entries(organizedBugs).map(([status, column], colIndex) => (
                <div key={status} className="col-md-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: colIndex * 0.1 }}>
                    <div className="stat-card" style={{ minHeight: '500px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{column.title}</h5>
                        <span className={`badge bg-${column.color}`}>{column.bugs.length}</span>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {column.bugs.map((bug, index) => (
                          <motion.div
                            key={bug._id}
                            className="card card-hover"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => openBugDetails(bug)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="card-body p-3">
                              <h6 className="mb-2">{bug.title}</h6>
                              <p className="text-muted small mb-2">{bug.description?.substring(0, 60)}...</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge priority-${bug.priority}`}>{bug.priority}</span>
                                <small className="text-muted">{bug.project?.name}</small>
                              </div>
                              {status !== 'resolved' && (
                                <motion.select
                                  className="form-select form-select-sm mt-2"
                                  value={bug.status}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(bug._id, e.target.value);
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="open">To Do</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="resolved">Done</option>
                                </motion.select>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && selectedBug && (
          <motion.div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowComments(false)}>
            <motion.div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
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
                    <strong>Description:</strong>
                    <p className="text-muted">{selectedBug.description}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Priority:</strong> <span className={`badge priority-${selectedBug.priority} ms-2`}>{selectedBug.priority}</span>
                  </div>
                  
                  <hr />
                  <h6 className="mb-3">
                    <i className="bi bi-chat-left-text me-2"></i>
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
                          <div className="d-flex justify-content-between align-items-start mb-2">
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
                    ))}
                  </div>

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
                        <i className="bi bi-send"></i> Send
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

export default DeveloperDashboard;
