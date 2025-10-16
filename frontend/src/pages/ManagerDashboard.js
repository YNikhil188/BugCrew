import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [emailNotification, setEmailNotification] = useState(true);
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    progress: 0
  });

  const [assignForm, setAssignForm] = useState({
    userId: '',
    role: 'developer',
    sendEmail: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes, bugsRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/users'),
        axios.get('/api/bugs')
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data.filter(u => u.role === 'developer' || u.role === 'tester'));
      setBugs(bugsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`/api/projects/${editingProject._id}`, projectForm);
      } else {
        await axios.post('/api/projects', projectForm);
      }
      setShowProjectModal(false);
      resetProjectForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving project');
    }
  };

  const handleAssignTeamMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/projects/${selectedProject._id}/team`, {
        userId: assignForm.userId,
        role: assignForm.role,
        sendEmail: assignForm.sendEmail
      });
      setShowAssignModal(false);
      setAssignForm({ userId: '', role: 'developer', sendEmail: true });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning team member');
    }
  };

  const handleRemoveTeamMember = async (projectId, userId) => {
    if (window.confirm('Remove this team member?')) {
      try {
        await axios.delete(`/api/projects/${projectId}/team/${userId}`);
        fetchData();
      } catch (error) {
        alert('Error removing team member');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        fetchData();
      } catch (error) {
        alert('Error deleting project');
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      progress: project.progress || 0
    });
    setShowProjectModal(true);
  };

  const resetProjectForm = () => {
    setProjectForm({
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

  // Chart Data
  const projectStatusData = {
    labels: ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold'],
    datasets: [{
      data: [
        projects.filter(p => p.status === 'planning').length,
        projects.filter(p => p.status === 'in-progress').length,
        projects.filter(p => p.status === 'testing').length,
        projects.filter(p => p.status === 'completed').length,
        projects.filter(p => p.status === 'on-hold').length
      ],
      backgroundColor: ['#6c757d', '#0d6efd', '#ffc107', '#198754', '#dc3545'],
      borderWidth: 0
    }]
  };

  const bugPriorityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      label: 'Bugs by Priority',
      data: [
        bugs.filter(b => b.priority === 'low').length,
        bugs.filter(b => b.priority === 'medium').length,
        bugs.filter(b => b.priority === 'high').length,
        bugs.filter(b => b.priority === 'critical').length
      ],
      backgroundColor: ['#198754', '#ffc107', '#fd7e14', '#dc3545']
    }]
  };

  const teamWorkloadData = {
    labels: users.slice(0, 6).map(u => u.name),
    datasets: [{
      label: 'Assigned Projects',
      data: users.slice(0, 6).map(u => 
        projects.filter(p => p.team?.some(t => t.user?._id === u._id)).length
      ),
      backgroundColor: '#0d6efd',
      borderRadius: 8
    }]
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
    const colors = { low: 'success', medium: 'warning', high: 'orange', critical: 'danger' };
    return <span className={`badge bg-${colors[priority]}`}>{priority}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role="manager" />
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
      <Sidebar role="manager" />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>
                <i className="bi bi-kanban me-3"></i>
                Project Manager Dashboard
              </h1>
              <button className="btn btn-primary" onClick={() => { resetProjectForm(); setShowProjectModal(true); }}>
                <i className="bi bi-plus-circle me-2"></i>
                New Project
              </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <motion.div className="stat-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <i className="bi bi-folder-fill fs-1 text-primary mb-3"></i>
                  <h3>{projects.length}</h3>
                  <p className="text-muted mb-0">Total Projects</p>
                </motion.div>
              </div>
              <div className="col-md-3">
                <motion.div className="stat-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <i className="bi bi-hourglass-split fs-1 text-warning mb-3"></i>
                  <h3>{projects.filter(p => p.status === 'in-progress').length}</h3>
                  <p className="text-muted mb-0">In Progress</p>
                </motion.div>
              </div>
              <div className="col-md-3">
                <motion.div className="stat-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <i className="bi bi-people-fill fs-1 text-success mb-3"></i>
                  <h3>{users.length}</h3>
                  <p className="text-muted mb-0">Team Members</p>
                </motion.div>
              </div>
              <div className="col-md-3">
                <motion.div className="stat-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <i className="bi bi-bug-fill fs-1 text-danger mb-3"></i>
                  <h3>{bugs.filter(b => b.status === 'open').length}</h3>
                  <p className="text-muted mb-0">Open Bugs</p>
                </motion.div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                  <h5 className="mb-4"><i className="bi bi-pie-chart me-2"></i>Project Status Distribution</h5>
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut data={projectStatusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                </motion.div>
              </div>
              <div className="col-md-4">
                <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                  <h5 className="mb-4"><i className="bi bi-bar-chart me-2"></i>Bug Priority Levels</h5>
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bar data={bugPriorityData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </motion.div>
              </div>
              <div className="col-md-4">
                <motion.div className="stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
                  <h5 className="mb-4"><i className="bi bi-graph-up me-2"></i>Team Workload</h5>
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bar data={teamWorkloadData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Projects List */}
            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <h4 className="mb-4"><i className="bi bi-folder2-open me-2"></i>Active Projects</h4>
              <div className="row g-3">
                {projects.map((project, index) => (
                  <div key={project._id} className="col-md-6">
                    <motion.div
                      className="border rounded p-3 h-100 bg-white"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="mb-1">{project.name}</h5>
                          <small className="text-muted">{project.description}</small>
                        </div>
                        <div className="d-flex gap-1">
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority)}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold">{project.progress || 0}%</small>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <motion.div 
                            className="progress-bar bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress || 0}%` }}
                            transition={{ duration: 1, delay: 1 + index * 0.05 }}
                          ></motion.div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <i className="bi bi-people me-1"></i>
                          <small>{project.team?.length || 0} members</small>
                        </div>
                        {project.startDate && (
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(project.startDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>

                      {/* Team Members */}
                      {project.team && project.team.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-2">Team:</small>
                          <div className="d-flex flex-wrap gap-2">
                            {project.team.map(member => (
                              <span key={member._id} className="badge bg-light text-dark border">
                                {member.user?.name || 'Unknown'} ({member.role})
                                <i 
                                  className="bi bi-x-circle ms-1" 
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleRemoveTeamMember(project._id, member.user?._id)}
                                ></i>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline-primary flex-grow-1"
                          onClick={() => handleEditProject(project)}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => { setSelectedProject(project); setShowAssignModal(true); }}
                        >
                          <i className="bi bi-person-plus"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <motion.div 
            className="modal show d-block" 
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProjectModal(false)}
          >
            <motion.div 
              className="modal-dialog modal-dialog-centered modal-lg"
              initial={{ scale: 0.7, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: -50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="modal-header bg-primary text-white">
                  <h5><i className="bi bi-folder-plus me-2"></i>{editingProject ? 'Edit Project' : 'Create New Project'}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowProjectModal(false)}></button>
                </div>
                <form onSubmit={handleCreateProject}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Project Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Description *</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Status</label>
                        <select 
                          className="form-select"
                          value={projectForm.status}
                          onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                        >
                          <option value="planning">Planning</option>
                          <option value="in-progress">In Progress</option>
                          <option value="testing">Testing</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Priority</label>
                        <select 
                          className="form-select"
                          value={projectForm.priority}
                          onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Start Date</label>
                        <input 
                          type="date" 
                          className="form-control"
                          value={projectForm.startDate}
                          onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">End Date</label>
                        <input 
                          type="date" 
                          className="form-control"
                          value={projectForm.endDate}
                          onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Progress: {projectForm.progress}%</label>
                      <input 
                        type="range" 
                        className="form-range"
                        min="0"
                        max="100"
                        value={projectForm.progress}
                        onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })}
                      />
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar bg-success" style={{ width: `${projectForm.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-2"></i>
                      {editingProject ? 'Update Project' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Team Member Modal */}
      <AnimatePresence>
        {showAssignModal && selectedProject && (
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
              initial={{ scale: 0.7, rotateX: 90 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.7, rotateX: -90 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="modal-header bg-success text-white">
                  <h5><i className="bi bi-person-plus me-2"></i>Assign Team Member</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowAssignModal(false)}></button>
                </div>
                <form onSubmit={handleAssignTeamMember}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Assigning to: <strong>{selectedProject.name}</strong>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Select Team Member *</label>
                      <select 
                        className="form-select"
                        value={assignForm.userId}
                        onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                        required
                      >
                        <option value="">Choose a team member...</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>
                            {u.name} - {u.email} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Role in Project</label>
                      <select 
                        className="form-select"
                        value={assignForm.role}
                        onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                      >
                        <option value="developer">Developer</option>
                        <option value="tester">Tester</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="sendEmail"
                        checked={assignForm.sendEmail}
                        onChange={(e) => setAssignForm({ ...assignForm, sendEmail: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="sendEmail">
                        <i className="bi bi-envelope me-1"></i>
                        Send email notification to team member
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">
                      <i className="bi bi-check-circle me-2"></i>
                      Assign Member
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

export default ManagerDashboard;
