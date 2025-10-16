import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

import API_BASE_URL from '../config/api';

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    resolvedBugs: 0,
    closedBugs: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0
  });
  const [bugsByPriority, setBugsByPriority] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [bugsBySeverity, setBugsBySeverity] = useState({
    critical: 0,
    major: 0,
    minor: 0,
    trivial: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const [bugsRes, projectsRes, usersRes] = await Promise.all([
        axios.get('${API_BASE_URL}/api/bugs'),
        axios.get('${API_BASE_URL}/api/projects'),
        user?.role === 'admin' ? axios.get('${API_BASE_URL}/api/users') : Promise.resolve({ data: [] })
      ]);

      const bugs = bugsRes.data;
      const projects = projectsRes.data;
      const users = usersRes.data;

      // Calculate bug statistics
      const bugStats = {
        totalBugs: bugs.length,
        openBugs: bugs.filter(b => b.status === 'open').length,
        inProgressBugs: bugs.filter(b => b.status === 'in-progress').length,
        resolvedBugs: bugs.filter(b => b.status === 'resolved').length,
        closedBugs: bugs.filter(b => b.status === 'closed').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalUsers: users.length
      };

      // Calculate bugs by priority
      const priorityStats = {
        critical: bugs.filter(b => b.priority === 'critical').length,
        high: bugs.filter(b => b.priority === 'high').length,
        medium: bugs.filter(b => b.priority === 'medium').length,
        low: bugs.filter(b => b.priority === 'low').length
      };

      // Calculate bugs by severity
      const severityStats = {
        critical: bugs.filter(b => b.severity === 'critical').length,
        major: bugs.filter(b => b.severity === 'major').length,
        minor: bugs.filter(b => b.severity === 'minor').length,
        trivial: bugs.filter(b => b.severity === 'trivial').length
      };

      // Get recent activity (last 10 bugs)
      const recent = bugs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setStats(bugStats);
      setBugsByPriority(priorityStats);
      setBugsBySeverity(severityStats);
      setRecentActivity(recent);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setLoading(false);
    }
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <Container className="mt-4">
        <h2 className="mb-4">Reports & Analytics</h2>

        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <>
            {/* Overview Stats */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-primary">{stats.totalBugs}</h3>
                    <p className="mb-0">Total Bugs</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-danger">{stats.openBugs}</h3>
                    <p className="mb-0">Open Bugs</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-success">{stats.resolvedBugs}</h3>
                    <p className="mb-0">Resolved Bugs</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-info">{stats.totalProjects}</h3>
                    <p className="mb-0">Total Projects</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Bug Status Breakdown */}
            <Row className="mb-4">
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5>Bug Status Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Open</td>
                          <td>{stats.openBugs}</td>
                          <td>{calculatePercentage(stats.openBugs, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td>In Progress</td>
                          <td>{stats.inProgressBugs}</td>
                          <td>{calculatePercentage(stats.inProgressBugs, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td>Resolved</td>
                          <td>{stats.resolvedBugs}</td>
                          <td>{calculatePercentage(stats.resolvedBugs, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td>Closed</td>
                          <td>{stats.closedBugs}</td>
                          <td>{calculatePercentage(stats.closedBugs, stats.totalBugs)}%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5>Bug Priority Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Priority</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="badge bg-danger">Critical</span></td>
                          <td>{bugsByPriority.critical}</td>
                          <td>{calculatePercentage(bugsByPriority.critical, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-warning">High</span></td>
                          <td>{bugsByPriority.high}</td>
                          <td>{calculatePercentage(bugsByPriority.high, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-info">Medium</span></td>
                          <td>{bugsByPriority.medium}</td>
                          <td>{calculatePercentage(bugsByPriority.medium, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-secondary">Low</span></td>
                          <td>{bugsByPriority.low}</td>
                          <td>{calculatePercentage(bugsByPriority.low, stats.totalBugs)}%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Severity Breakdown */}
            <Row className="mb-4">
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5>Bug Severity Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Severity</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Critical</td>
                          <td>{bugsBySeverity.critical}</td>
                          <td>{calculatePercentage(bugsBySeverity.critical, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td>Major</td>
                          <td>{bugsBySeverity.major}</td>
                          <td>{calculatePercentage(bugsBySeverity.major, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td>Minor</td>
                          <td>{bugsBySeverity.minor}</td>
                          <td>{calculatePercentage(bugsBySeverity.minor, stats.totalBugs)}%</td>
                        </tr>
                        <tr>
                          <td>Trivial</td>
                          <td>{bugsBySeverity.trivial}</td>
                          <td>{calculatePercentage(bugsBySeverity.trivial, stats.totalBugs)}%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              {user?.role === 'admin' && (
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5>System Overview</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered hover size="sm">
                        <tbody>
                          <tr>
                            <td><strong>Total Users</strong></td>
                            <td>{stats.totalUsers}</td>
                          </tr>
                          <tr>
                            <td><strong>Total Projects</strong></td>
                            <td>{stats.totalProjects}</td>
                          </tr>
                          <tr>
                            <td><strong>Active Projects</strong></td>
                            <td>{stats.activeProjects}</td>
                          </tr>
                          <tr>
                            <td><strong>Total Bugs</strong></td>
                            <td>{stats.totalBugs}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>

            {/* Recent Activity */}
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <h5>Recent Bug Activity</h5>
                  </Card.Header>
                  <Card.Body>
                    {recentActivity.length === 0 ? (
                      <p className="text-muted">No recent activity</p>
                    ) : (
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Project</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.map(bug => (
                            <tr key={bug._id}>
                              <td>{bug.title}</td>
                              <td>{bug.project?.name || 'N/A'}</td>
                              <td>
                                <span className={`badge ${
                                  bug.status === 'open' ? 'bg-danger' :
                                  bug.status === 'in-progress' ? 'bg-warning' :
                                  bug.status === 'resolved' ? 'bg-success' :
                                  'bg-secondary'
                                }`}>
                                  {bug.status}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  bug.priority === 'critical' ? 'bg-danger' :
                                  bug.priority === 'high' ? 'bg-warning' :
                                  bug.priority === 'medium' ? 'bg-info' :
                                  'bg-secondary'
                                }`}>
                                  {bug.priority}
                                </span>
                              </td>
                              <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
        </Container>
      </div>
    </div>
  );
};

export default ReportsPage;
