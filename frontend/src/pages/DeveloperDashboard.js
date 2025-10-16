import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../config/api';


const DeveloperDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

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
      console.log('Developer Dashboard - Fetching data for user:', user);
      const [bugsRes, projectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/bugs`),
        axios.get(`${API_BASE_URL}/api/projects`)
      ]);
      
      console.log('Fetched bugs from API:', bugsRes.data);
      console.log('Fetched projects from API:', projectsRes.data);
      
      // Backend already filters bugs for developers, no need to filter again
      setBugs(bugsRes.data);
      
      // Set all projects
      setAllProjects(projectsRes.data);
      
      // Filter projects where user is a team member (My Projects)
      const userProjects = projectsRes.data.filter(p => {
        if (!p.team || !Array.isArray(p.team)) return false;
        return p.team.some(member => {
          const memberId = member.user?._id || member.user || member._id;
          return memberId === user._id || memberId?.toString() === user._id?.toString();
        });
      });
      
      console.log('My Projects for developer:', userProjects);
      setMyProjects(userProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const fetchComments = async (bugId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comments/bug/${bugId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/bugs/${bugId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert('Error updating bug status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/comments/bug/${selectedBug._id}`, { content: newComment });
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

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="developer" />
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
              <div className="d-flex gap-2">
                <button 
                  className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('kanban')}
                >
                  <i className="bi bi-kanban me-1"></i>Kanban
                </button>
                <button 
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list-ul me-1"></i>List
                </button>
                {/* <button 
                  className="btn btn-sm btn-outline-info"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                >
                  <i className="bi bi-folder2 me-1"></i>Projects ({allProjects.length})
                </button>
                <button 
                  className="btn btn-sm btn-outline-success"
                  onClick={() => setShowMyProjects(!showMyProjects)}
                >
                  <i className="bi bi-folder-fill me-1"></i>My Projects ({myProjects.length})
                </button> */}
              </div>
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

            {/* All Projects Section */}
            <AnimatePresence>
              {showAllProjects && (
                <motion.div 
                  className="stat-card mb-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h5 className="mb-3">
                    <i className="bi bi-folder2 me-2 text-info"></i>
                    All Projects
                  </h5>
                  <div className="row g-3">
                    {allProjects.length === 0 ? (
                      <div className="col-12 text-center py-4">
                        <p className="text-muted">No projects available</p>
                      </div>
                    ) : (
                      allProjects.map((project, index) => (
                        <div key={project._id} className="col-md-4">
                          <motion.div
                            className="card h-100 card-hover"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="card-body">
                              <h6 className="mb-2">{project.name}</h6>
                              <p className="text-muted small mb-3">{project.description}</p>
                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <small>Progress</small>
                                  <small>{project.progress || 0}%</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div className="progress-bar bg-success" style={{ width: `${project.progress || 0}%` }}></div>
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <span className={`badge bg-${project.status === 'completed' ? 'success' : project.status === 'in-progress' ? 'primary' : 'secondary'}`}>
                                  {project.status}
                                </span>
                                <span className={`badge bg-${project.priority === 'critical' ? 'danger' : project.priority === 'high' ? 'warning' : 'info'}`}>
                                  {project.priority}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* My Projects Section */}
            <AnimatePresence>
              {showMyProjects && (
                <motion.div 
                  className="stat-card mb-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h5 className="mb-3">
                    <i className="bi bi-folder-fill me-2 text-success"></i>
                    My Projects
                  </h5>
                  <div className="row g-3">
                    {myProjects.length === 0 ? (
                      <div className="col-12 text-center py-4">
                        <p className="text-muted">No projects assigned to you</p>
                      </div>
                    ) : (
                      myProjects.map((project, index) => (
                        <div key={project._id} className="col-md-4">
                        <motion.div
                          className="card h-100 card-hover"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="card-body">
                            <h6 className="mb-2">{project.name}</h6>
                            <p className="text-muted small mb-3">{project.description}</p>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <small>Progress</small>
                                <small>{project.progress || 0}%</small>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${project.progress || 0}%` }}></div>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <span className={`badge bg-${project.status === 'completed' ? 'success' : project.status === 'in-progress' ? 'primary' : 'secondary'}`}>
                                {project.status}
                              </span>
                              <span className={`badge bg-${project.priority === 'critical' ? 'danger' : project.priority === 'high' ? 'warning' : 'info'}`}>
                                {project.priority}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State for No Bugs */}
            {bugs.length === 0 && (
              <div className="stat-card text-center py-5">
                <i className="bi bi-bug fs-1 text-muted mb-3"></i>
                <h4 className="text-muted">No Bugs Assigned Yet</h4>
                <p className="text-muted mb-4">
                  You don't have any bugs assigned to you at the moment.
                  <br />
                  Your manager will assign bugs to you from the Team page or Bugs page.
                </p>
                <div className="alert alert-info d-inline-block text-start" style={{ maxWidth: '500px' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>How bugs get assigned:</strong>
                  <ul className="mb-0 mt-2" style={{ fontSize: '0.9rem' }}>
                    <li>Tester reports a bug</li>
                    <li>Manager assigns it to a developer</li>
                    <li>Bug appears in your Kanban board</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && bugs.length > 0 && (
              <div>
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
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-0">{bug.title}</h6>
                                {bug.screenshots && bug.screenshots.length > 0 && (
                                  <span className="badge bg-info" title={`${bug.screenshots.length} attachment(s)`}>
                                    <i className="bi bi-paperclip"></i> {bug.screenshots.length}
                                  </span>
                                )}
                              </div>
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
                </div>
              )}
          

            {/* List View */}
            {viewMode === 'list' && bugs.length > 0 && (
              <div>
                <h4 className="mb-3">
                  <i className="bi bi-list-ul me-2"></i>
                  Bug List
                </h4>
                <div className="stat-card">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Bug</th>
                          <th>Project</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bugs.map((bug, index) => (
                          <motion.tr
                            key={bug._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            style={{ cursor: 'pointer' }}
                            onClick={() => openBugDetails(bug)}
                          >
                            <td>
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <strong>{bug.title}</strong>
                                  <br />
                                  <small className="text-muted">{bug.description?.substring(0, 50)}...</small>
                                </div>
                                {bug.screenshots && bug.screenshots.length > 0 && (
                                  <span className="badge bg-info ms-2" title={`${bug.screenshots.length} attachment(s)`}>
                                    <i className="bi bi-paperclip"></i> {bug.screenshots.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{bug.project?.name}</td>
                            <td>
                              <span className={`badge priority-${bug.priority}`}>{bug.priority}</span>
                            </td>
                            <td>
                              <motion.select
                                className="form-select form-select-sm"
                                value={bug.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(bug._id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </motion.select>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBugDetails(bug);
                                }}
                              >
                                <i className="bi bi-chat"></i> Comments
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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
                  
                  {/* Steps to Reproduce */}
                  {selectedBug.stepsToReproduce && (
                    <div className="mb-3">
                      <strong>Steps to Reproduce:</strong>
                      <p className="text-muted">{selectedBug.stepsToReproduce}</p>
                    </div>
                  )}
                  
                  {/* Environment */}
                  {selectedBug.environment && (
                    <div className="mb-3">
                      <strong>Environment:</strong>
                      <p className="text-muted">{selectedBug.environment}</p>
                    </div>
                  )}
                  
                  {/* Attachments/Screenshots */}
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

export default DeveloperDashboard;
