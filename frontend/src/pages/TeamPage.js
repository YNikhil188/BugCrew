import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import API_BASE_URL from '../config/api';

const TeamPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignBugModal, setShowAssignBugModal] = useState(false);
  const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBugId, setSelectedBugId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [usersRes, projectsRes, bugsRes] = await Promise.all([
        axios.get('${API_BASE_URL}/api/users', config),
        axios.get('${API_BASE_URL}/api/projects', config),
        axios.get('${API_BASE_URL}/api/bugs', config)
      ]);
      
      console.log('Fetched users:', usersRes.data);
      console.log('Fetched projects:', projectsRes.data);
      console.log('Fetched bugs:', bugsRes.data);
      
      // Filter to only developers and testers
      setUsers(usersRes.data.filter(u => u.role === 'developer' || u.role === 'tester'));
      setProjects(projectsRes.data);
      setBugs(bugsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const getTeamMemberProjects = (userId) => {
    return projects.filter(p => {
      // Check if user is in project team
      if (!p.team || !Array.isArray(p.team)) return false;
      
      return p.team.some(member => {
        // Handle different possible structures
        const memberId = member.user?._id || member.user || member._id;
        return memberId === userId || memberId?.toString() === userId?.toString();
      });
    });
  };

  const getTeamMemberBugs = (userId) => {
    return bugs.filter(b => {
      if (!b.assignedTo) return false;
      
      // Handle different possible structures
      const assignedId = b.assignedTo._id || b.assignedTo;
      return assignedId === userId || assignedId?.toString() === userId?.toString();
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      developer: 'primary',
      tester: 'success'
    };
    return <span className={`badge bg-${colors[role]}`}>{role}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      inactive: 'danger'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status || 'active'}</span>;
  };

  const handleAssignBug = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/bugs/${selectedBugId}/assign`, {
        userId: selectedMember._id,
        sendEmail: sendEmail
      });
      setShowAssignBugModal(false);
      setSelectedBugId('');
      setSendEmail(true);
      fetchData(); // Refresh data
      alert('Bug assigned successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning bug');
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    try {
      const project = projects.find(p => p._id === selectedProjectId);
      if (!project) return;

      // Add member to project team if not already there
      const isAlreadyInTeam = project.team?.some(member => {
        const memberId = member.user?._id || member.user || member._id;
        return memberId === selectedMember._id;
      });

      if (isAlreadyInTeam) {
        alert('This member is already assigned to this project');
        return;
      }

      // Add the member to the team
      const updatedTeam = [...(project.team || []), { user: selectedMember._id, role: selectedMember.role }];
      
      await axios.put(`/api/projects/${selectedProjectId}`, {
        ...project,
        team: updatedTeam
      });

      setShowAssignProjectModal(false);
      setSelectedProjectId('');
      fetchData(); // Refresh data
      alert('Project assigned successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning project');
    }
  };

  // Get unassigned bugs (for the selected member)
  const getAvailableBugs = () => {
    if (!selectedMember || selectedMember.role !== 'developer') return [];
    return bugs.filter(b => !b.assignedTo || b.status === 'open');
  };

  // Get all projects (member can be added to any project)
  const getAvailableProjects = () => {
    if (!selectedMember) return [];
    const memberProjects = getTeamMemberProjects(selectedMember._id);
    const assignedProjectIds = memberProjects.map(p => p._id);
    return projects.filter(p => !assignedProjectIds.includes(p._id));
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar role={user?.role} />
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
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>
                <i className="bi bi-people me-3"></i>
                Team Members
              </h1>
              <div className="d-flex gap-2">
                <span className="badge bg-primary fs-6">{users.filter(u => u.role === 'developer').length} Developers</span>
                <span className="badge bg-success fs-6">{users.filter(u => u.role === 'tester').length} Testers</span>
              </div>
            </div>

            {/* Assignment Rules Info */}
            {user?.role === 'manager' && (
              <div className="alert alert-info mb-4 d-flex align-items-center gap-3" style={{ borderRadius: '10px' }}>
                <i className="bi bi-info-circle-fill fs-4"></i>
                <div className="flex-grow-1">
                  <strong>Assignment Rules:</strong>
                  <ul className="mb-0 mt-2" style={{ fontSize: '0.9rem' }}>
                    <li><i className="bi bi-bug-fill text-danger me-1"></i> <strong>Bugs</strong> can only be assigned to <strong>Developers</strong></li>
                    <li><i className="bi bi-folder-fill text-primary me-1"></i> <strong>Projects</strong> can be assigned to both <strong>Developers</strong> and <strong>Testers</strong></li>
                  </ul>
                </div>
              </div>
            )}

            {users.length === 0 ? (
              <div className="stat-card text-center py-5">
                <i className="bi bi-people fs-1 text-muted mb-3"></i>
                <p className="text-muted">No team members found</p>
              </div>
            ) : (
              <div className="row g-4">
                {users.map((member, index) => {
                  const memberProjects = getTeamMemberProjects(member._id);
                  const memberBugs = getTeamMemberBugs(member._id);

                  return (
                    <div key={member._id} className="col-md-6 col-lg-4">
                      <motion.div
                        className="stat-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                      >
                        {/* Member Header */}
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                                 style={{ width: '50px', height: '50px' }}>
                              <i className="bi bi-person-fill fs-4 text-white"></i>
                            </div>
                            <div>
                              <h5 className="mb-1">{member.name}</h5>
                              <small className="text-muted">{member.email}</small>
                            </div>
                          </div>
                        </div>

                        {/* Role & Status */}
                        <div className="d-flex gap-2 mb-3">
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>

                        <hr />

                        {/* Assigned Projects */}
                        <div className="mb-3">
                          <h6 className="mb-2">
                            <i className="bi bi-folder me-2 text-primary"></i>
                            Projects ({memberProjects.length})
                          </h6>
                          {memberProjects.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {memberProjects.slice(0, 3).map(project => (
                                <span key={project._id} className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
                                  {project.name}
                                </span>
                              ))}
                              {memberProjects.length > 3 && (
                                <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                  +{memberProjects.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <small className="text-muted">No projects assigned</small>
                          )}
                        </div>

                        {/* Assigned Bugs */}
                        <div className="mb-3">
                          <h6 className="mb-2 d-flex align-items-center justify-content-between">
                            <span>
                              <i className="bi bi-bug me-2 text-danger"></i>
                              Assigned Bugs ({memberBugs.length})
                            </span>
                            {member.role === 'developer' && user?.role === 'manager' && (
                              <span className="badge bg-success" style={{ fontSize: '0.65rem' }} title="Can receive bug assignments">
                                <i className="bi bi-check-circle-fill me-1"></i>Eligible
                              </span>
                            )}
                            {member.role === 'tester' && user?.role === 'manager' && (
                              <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }} title="Cannot receive bug assignments">
                                <i className="bi bi-x-circle-fill me-1"></i>N/A
                              </span>
                            )}
                          </h6>
                          {member.role === 'developer' && memberBugs.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {memberBugs.slice(0, 2).map(bug => (
                                <div key={bug._id} className="d-flex justify-content-between align-items-center p-2 bg-light rounded" style={{ fontSize: '0.85rem' }}>
                                  <span className="text-truncate" style={{ maxWidth: '200px' }}>{bug.title}</span>
                                  <span className={`badge bg-${
                                    bug.priority === 'critical' ? 'danger' :
                                    bug.priority === 'high' ? 'warning' :
                                    bug.priority === 'medium' ? 'info' : 'success'
                                  }`} style={{ fontSize: '0.7rem' }}>
                                    {bug.priority}
                                  </span>
                                </div>
                              ))}
                              {memberBugs.length > 2 && (
                                <small className="text-muted">+{memberBugs.length - 2} more bugs</small>
                              )}
                            </div>
                          ) : member.role === 'tester' ? (
                            <small className="text-muted fst-italic">Testers cannot be assigned bugs</small>
                          ) : (
                            <small className="text-muted">No bugs assigned</small>
                          )}
                        </div>

                        {/* Workload Indicator */}
                        <div className="mt-3">
                          <small className="text-muted">Workload</small>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar ${
                                (memberProjects.length + memberBugs.length) > 5 ? 'bg-danger' :
                                (memberProjects.length + memberBugs.length) > 3 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${Math.min(((memberProjects.length + memberBugs.length) / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between mt-1">
                            <small className="text-muted">
                              {memberProjects.length + memberBugs.length} total assignments
                            </small>
                            <small className="text-muted">
                              {(memberProjects.length + memberBugs.length) > 5 ? 'High' :
                               (memberProjects.length + memberBugs.length) > 3 ? 'Medium' : 'Light'}
                            </small>
                          </div>
                        </div>

                        {/* Assignment Buttons (Manager Only) */}
                        {user?.role === 'manager' && (
                          <div className="mt-3 d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary flex-grow-1"
                              onClick={() => { setSelectedMember(member); setShowAssignProjectModal(true); }}
                            >
                              <i className="bi bi-folder-plus me-1"></i>
                              Assign Project
                            </button>
                            {member.role === 'developer' && (
                              <button 
                                className="btn btn-sm btn-outline-danger flex-grow-1"
                                onClick={() => { setSelectedMember(member); setShowAssignBugModal(true); }}
                              >
                                <i className="bi bi-bug-fill me-1"></i>
                                Assign Bug
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary Stats */}
            <motion.div 
              className="row g-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="bi bi-people-fill fs-2 text-primary mb-2"></i>
                  <h3>{users.length}</h3>
                  <p className="text-muted mb-0">Total Team Members</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="bi bi-folder-fill fs-2 text-success mb-2"></i>
                  <h3>{projects.length}</h3>
                  <p className="text-muted mb-0">Active Projects</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="bi bi-bug-fill fs-2 text-danger mb-2"></i>
                  <h3>{bugs.filter(b => b.assignedTo).length}</h3>
                  <p className="text-muted mb-0">Assigned Bugs</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="bi bi-clock-fill fs-2 text-warning mb-2"></i>
                  <h3>{bugs.filter(b => b.status === 'in-progress').length}</h3>
                  <p className="text-muted mb-0">In Progress</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Assign Bug Modal */}
      <AnimatePresence>
        {showAssignBugModal && selectedMember && (
          <motion.div
            className="modal show d-block"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAssignBugModal(false)}
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
                <div className="modal-header bg-danger text-white">
                  <h5>
                    <i className="bi bi-bug-fill me-2"></i>
                    Assign Bug to {selectedMember.name}
                  </h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowAssignBugModal(false)}></button>
                </div>
                <form onSubmit={handleAssignBug}>
                  <div className="modal-body">
                    <div className="alert alert-warning">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Note:</strong> Only developers can be assigned bugs. {selectedMember.name} is a {selectedMember.role}.
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Select Bug *</label>
                      <select
                        className="form-select"
                        value={selectedBugId}
                        onChange={(e) => setSelectedBugId(e.target.value)}
                        required
                      >
                        <option value="">Choose a bug...</option>
                        {getAvailableBugs().map(bug => (
                          <option key={bug._id} value={bug._id}>
                            [{bug.priority.toUpperCase()}] {bug.title} - {bug.project?.name || 'No Project'}
                          </option>
                        ))}
                      </select>
                      {getAvailableBugs().length === 0 && (
                        <small className="text-muted">No unassigned bugs available</small>
                      )}
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                      />
                      <label className="form-check-label">
                        Send email notification to {selectedMember.name}
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignBugModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={!selectedBugId}>
                      <i className="bi bi-check-circle me-1"></i>
                      Assign Bug
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Project Modal */}
      <AnimatePresence>
        {showAssignProjectModal && selectedMember && (
          <motion.div
            className="modal show d-block"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAssignProjectModal(false)}
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
                <div className="modal-header bg-primary text-white">
                  <h5>
                    <i className="bi bi-folder-fill me-2"></i>
                    Assign Project to {selectedMember.name}
                  </h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowAssignProjectModal(false)}></button>
                </div>
                <form onSubmit={handleAssignProject}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Note:</strong> {selectedMember.name} is a {selectedMember.role}. Projects can be assigned to both developers and testers.
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Select Project *</label>
                      <select
                        className="form-select"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        required
                      >
                        <option value="">Choose a project...</option>
                        {getAvailableProjects().map(project => (
                          <option key={project._id} value={project._id}>
                            {project.name} - {project.status || 'Active'}
                          </option>
                        ))}
                      </select>
                      {getAvailableProjects().length === 0 && (
                        <small className="text-muted">All projects already assigned to this member</small>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignProjectModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!selectedProjectId}>
                      <i className="bi bi-check-circle me-1"></i>
                      Assign Project
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

export default TeamPage;
