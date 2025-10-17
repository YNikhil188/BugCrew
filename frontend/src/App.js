import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import TesterDashboard from './pages/TesterDashboard';
import UsersPage from './pages/UsersPage';
import ProjectsPage from './pages/ProjectsPage';
import BugsPage from './pages/BugsPage';
import GenericPage from './pages/GenericPage';
import ProfilePage from './pages/ProfilePage';
import TeamPage from './pages/TeamPage';
import MyProjectsPage from './pages/MyProjectsPage';
import TesterMyProjectsPage from './pages/TesterMyProjectsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import ChatPage from './pages/ChatPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SidebarProvider>
          <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/manager/dashboard" element={
            <PrivateRoute roles={['manager']}>
              <ManagerDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/developer/dashboard" element={
            <PrivateRoute roles={['developer']}>
              <DeveloperDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/tester/dashboard" element={
            <PrivateRoute roles={['tester']}>
              <TesterDashboard />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
              <UsersPage />
            </PrivateRoute>
          } />
          <Route path="/admin/projects" element={
            <PrivateRoute roles={['admin']}>
              <ProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/admin/bugs" element={
            <PrivateRoute roles={['admin']}>
              <BugsPage />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute roles={['admin']}>
              <ReportsPage />
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute roles={['admin']}>
              <SettingsPage />
            </PrivateRoute>
          } />
          <Route path="/admin/profile" element={
            <PrivateRoute roles={['admin']}>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/admin/chat" element={
            <PrivateRoute roles={['admin']}>
              <ChatPage />
            </PrivateRoute>
          } />
          
          {/* Manager Routes */}
          <Route path="/manager/projects" element={
            <PrivateRoute roles={['manager']}>
              <ProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/manager/team" element={
            <PrivateRoute roles={['manager']}>
              <TeamPage />
            </PrivateRoute>
          } />
          <Route path="/manager/bugs" element={
            <PrivateRoute roles={['manager']}>
              <BugsPage />
            </PrivateRoute>
          } />
          <Route path="/manager/reports" element={
            <PrivateRoute roles={['manager']}>
              <ReportsPage />
            </PrivateRoute>
          } />
          <Route path="/manager/settings" element={
            <PrivateRoute roles={['manager']}>
              <SettingsPage />
            </PrivateRoute>
          } />
          <Route path="/manager/profile" element={
            <PrivateRoute roles={['manager']}>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/manager/chat" element={
            <PrivateRoute roles={['manager']}>
              <ChatPage />
            </PrivateRoute>
          } />
          
          {/* Developer Routes */}
          <Route path="/developer/bugs" element={
            <PrivateRoute roles={['developer']}>
              <BugsPage />
            </PrivateRoute>
          } />
          <Route path="/developer/projects" element={
            <PrivateRoute roles={['developer']}>
              <ProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/developer/myprojects" element={
            <PrivateRoute roles={['developer']}>
              <MyProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/developer/profile" element={
            <PrivateRoute roles={['developer']}>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/developer/settings" element={
            <PrivateRoute roles={['developer']}>
              <SettingsPage />
            </PrivateRoute>
          } />
          <Route path="/developer/chat" element={
            <PrivateRoute roles={['developer']}>
              <ChatPage />
            </PrivateRoute>
          } />
          
          {/* Tester Routes */}
          <Route path="/tester/bugs" element={
            <PrivateRoute roles={['tester']}>
              <BugsPage />
            </PrivateRoute>
          } />
          <Route path="/tester/mybugs" element={
            <PrivateRoute roles={['tester']}>
              <BugsPage />
            </PrivateRoute>
          } />
          <Route path="/tester/projects" element={
            <PrivateRoute roles={['tester']}>
              <ProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/tester/myprojects" element={
            <PrivateRoute roles={['tester']}>
              <TesterMyProjectsPage />
            </PrivateRoute>
          } />
          <Route path="/tester/settings" element={
            <PrivateRoute roles={['tester']}>
              <SettingsPage />
            </PrivateRoute>
          } />
          <Route path="/tester/profile" element={
            <PrivateRoute roles={['tester']}>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/tester/chat" element={
            <PrivateRoute roles={['tester']}>
              <ChatPage />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
          </Router>
        </SidebarProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
