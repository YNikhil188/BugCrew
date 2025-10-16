import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>
                <i className="bi bi-gear me-3"></i>
                Settings
              </h1>
            </div>

            <div className="row g-4">
              {/* Account Settings */}
              <div className="col-md-6">
                <div className="stat-card">
                  <h5 className="mb-3">
                    <i className="bi bi-person-circle me-2"></i>
                    Account Settings
                  </h5>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" defaultValue={user?.name} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" defaultValue={user?.email} disabled />
                    <small className="text-muted">Contact admin to change email</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <input type="text" className="form-control" value={user?.role} disabled />
                  </div>
                  <button className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Password Settings */}
              <div className="col-md-6">
                <div className="stat-card">
                  <h5 className="mb-3">
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </h5>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <button className="btn btn-warning">
                    <i className="bi bi-key me-2"></i>
                    Update Password
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="col-md-6">
                <div className="stat-card">
                  <h5 className="mb-3">
                    <i className="bi bi-bell me-2"></i>
                    Notification Preferences
                  </h5>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
                    <label className="form-check-label" htmlFor="emailNotif">
                      Email Notifications
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="bugAssigned" defaultChecked />
                    <label className="form-check-label" htmlFor="bugAssigned">
                      Bug Assignment Alerts
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="projectUpdates" defaultChecked />
                    <label className="form-check-label" htmlFor="projectUpdates">
                      Project Updates
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="bugResolved" defaultChecked />
                    <label className="form-check-label" htmlFor="bugResolved">
                      Bug Resolution Notifications
                    </label>
                  </div>
                  <button className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Save Preferences
                  </button>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="col-md-6">
                <div className="stat-card">
                  <h5 className="mb-3">
                    <i className="bi bi-palette me-2"></i>
                    Appearance
                  </h5>
                  <div className="mb-3">
                    <label className="form-label">Theme</label>
                    <select className="form-select">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Language</label>
                    <select className="form-select">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="compactMode" />
                    <label className="form-check-label" htmlFor="compactMode">
                      Compact Mode
                    </label>
                  </div>
                  <button className="btn btn-info">
                    <i className="bi bi-palette me-2"></i>
                    Apply Theme
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="stat-card mt-4 border-danger">
              <h5 className="mb-3 text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Danger Zone
              </h5>
              <p className="text-muted">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn btn-outline-danger">
                <i className="bi bi-trash me-2"></i>
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
