import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, projects: 0, bugs: 0, resolved: 0 });
  const [bugStats, setBugStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, projectsRes, bugsRes, bugStatsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/projects'),
        axios.get('/api/bugs'),
        axios.get('/api/bugs/stats')
      ]);

      setStats({
        users: usersRes.data.length,
        projects: projectsRes.data.length,
        bugs: bugsRes.data.length,
        resolved: bugsRes.data.filter(b => b.status === 'resolved').length
      });
      setBugStats(bugStatsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: 'bi-people', color: '#667eea', bgColor: 'rgba(102, 126, 234, 0.1)' },
    { title: 'Projects', value: stats.projects, icon: 'bi-folder', color: '#764ba2', bgColor: 'rgba(118, 75, 162, 0.1)' },
    { title: 'Active Bugs', value: stats.bugs, icon: 'bi-bug', color: '#f5576c', bgColor: 'rgba(245, 87, 108, 0.1)' },
    { title: 'Resolved', value: stats.resolved, icon: 'bi-check-circle', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)' }
  ];

  const statusChartData = bugStats ? {
    labels: bugStats.statusStats.map(s => s._id),
    datasets: [{
      data: bugStats.statusStats.map(s => s.count),
      backgroundColor: ['#17a2b8', '#ffc107', '#28a745', '#6c757d', '#dc3545'],
      borderWidth: 0
    }]
  } : null;

  const priorityChartData = bugStats ? {
    labels: bugStats.priorityStats.map(s => s._id),
    datasets: [{
      label: 'Bugs by Priority',
      data: bugStats.priorityStats.map(s => s.count),
      backgroundColor: ['#28a745', '#ffc107', '#fd7e14', '#dc3545']
    }]
  } : null;

  return (
    <div className="d-flex">
      <Sidebar role="admin" />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4">
              <i className="bi bi-speedometer2 me-3"></i>
              Admin Dashboard
            </h1>
          </motion.div>

          <div className="row g-4 mb-4">
            {statCards.map((card, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-2">{card.title}</p>
                      <h2 className="mb-0" style={{ color: card.color }}>{card.value}</h2>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: card.bgColor
                      }}
                    >
                      <i className={`bi ${card.icon} fs-2`} style={{ color: card.color }}></i>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="mb-4">
                  <i className="bi bi-pie-chart me-2"></i>
                  Bugs by Status
                </h4>
                {statusChartData && (
                  <div className="chart-container">
                    <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                )}
              </motion.div>
            </div>

            <div className="col-lg-6">
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="mb-4">
                  <i className="bi bi-bar-chart me-2"></i>
                  Bugs by Priority
                </h4>
                {priorityChartData && (
                  <div className="chart-container">
                    <Bar data={priorityChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <motion.div
            className="row g-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="col-12">
              <div className="stat-card">
                <h4 className="mb-4">
                  <i className="bi bi-activity me-2"></i>
                  Recent Activity
                </h4>
                <div className="list-group list-group-flush">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <motion.div
                      key={i}
                      className="list-group-item border-0 px-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="avatar bg-primary text-white rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-person"></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0"><strong>User {i + 1}</strong> reported a new bug</p>
                          <small className="text-muted">{i + 1} hours ago</small>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
