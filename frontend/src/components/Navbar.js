import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ user }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className="navbar navbar-custom"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center flex-grow-1">
          <button className="btn btn-link text-dark d-md-none">
            <i className="bi bi-list fs-4"></i>
          </button>
          <div className="input-group ms-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="dropdown">
            <button
              className="btn btn-link text-dark position-relative"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}>
              <li>
                <h6 className="dropdown-header d-flex justify-content-between align-items-center">
                  <span>Notifications</span>
                  <span className="badge bg-danger">3</span>
                </h6>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item py-2" href="#" style={{ whiteSpace: 'normal' }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-bug-fill text-danger me-2 mt-1"></i>
                    <div>
                      <strong>New bug assigned</strong>
                      <br />
                      <small className="text-muted">Login Button Not Working</small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item py-2" href="#" style={{ whiteSpace: 'normal' }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-folder-fill text-primary me-2 mt-1"></i>
                    <div>
                      <strong>Project updated</strong>
                      <br />
                      <small className="text-muted">Website Redesign progress 45%</small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item py-2" href="#" style={{ whiteSpace: 'normal' }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-arrow-counterclockwise text-warning me-2 mt-1"></i>
                    <div>
                      <strong>Bug reopened</strong>
                      <br />
                      <small className="text-muted">Fix needs revision</small>
                    </div>
                  </div>
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-center text-primary" href="#">
                  <small>View all notifications</small>
                </a>
              </li>
            </ul>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-link text-dark d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="avatar bg-primary text-white rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-start d-none d-md-block">
                <div className="fw-bold">{user?.name}</div>
                <small className="text-muted">{user?.role}</small>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow" style={{ minWidth: '200px' }}>
              <li>
                <div className="dropdown-header">
                  <div className="fw-bold">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Link className="dropdown-item py-2" to={`/${user?.role}/profile`}>
                  <i className="bi bi-person me-2"></i>Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to={`/${user?.role}/settings`}>
                  <i className="bi bi-gear me-2"></i>Settings
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
