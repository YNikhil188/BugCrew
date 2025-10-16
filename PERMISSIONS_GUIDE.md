# 🔐 Bug Tracker - Role-Based Permissions Guide

## Overview
This document outlines the complete permission structure for all user roles in the Bug Tracker application.

---

## 👑 Admin Role

### Users Management
✅ **Full CRUD Access**
- Create new users
- View all users
- Edit user details (name, email, role)
- Delete users
- Activate/Deactivate users

### Projects
✅ **View Only (Read-Only)**
- View all projects
- See project details
- See team members
- ❌ Cannot create projects
- ❌ Cannot edit projects
- ❌ Cannot delete projects
- ❌ Cannot assign team members

### Bugs
✅ **View Only (Read-Only)**
- View all bugs
- See bug details
- ❌ Cannot create bugs
- ❌ Cannot edit bugs
- ❌ Cannot delete bugs
- ❌ Cannot change bug status
- ❌ Cannot assign bugs

### Reports
✅ **Full Access**
- View all reports and analytics
- Export data

---

## 👨‍💼 Manager Role

### Projects
✅ **Full CRUD Access**
- Create new projects
- View all projects
- Edit project details
- Delete projects
- Assign team members (developers/testers)
- Remove team members
- Update project progress
- Send email notifications on assignment

### Bugs
✅ **View & Assign Access**
- View all bugs across all projects
- See bug details and status
- **Assign bugs to developers and testers**
- Send email notifications on assignment (optional)
- ❌ Cannot create bugs
- ❌ Cannot edit bug details
- ❌ Cannot delete bugs
- ❌ Cannot change bug status

### Reports
✅ **Full Access**
- View project analytics
- View team performance
- View bug statistics
- Access dashboard charts

### Users
❌ **No Access**
- Cannot manage users

---

## 👨‍💻 Developer Role

### Bugs
✅ **Partial Access**
- View bugs assigned to them only
- Edit bugs they're working on
- Update bug status (open, in-progress, resolved, closed, reopened)
- Add comments to bugs
- ❌ Cannot delete bugs
- ❌ Cannot assign bugs to others

### Projects
✅ **View Only**
- View projects they're assigned to
- See project details
- ❌ Cannot create/edit/delete projects

### Reports
✅ **Limited Access**
- View their own bug reports
- See their assigned tasks

---

## 🧪 Tester Role

### Bugs
✅ **Create & Verify Access**
- Report new bugs with screenshots
- View bugs they reported (My Reports)
- **Verify resolved bugs** (close or reopen)
- Add comments to bugs
- ❌ Cannot edit bug details after creation
- ❌ Cannot delete bugs
- ❌ Cannot change bug status (except verification)
- ❌ Cannot assign bugs

### Projects
✅ **View Only**
- View projects they're assigned to
- See project details
- ❌ Cannot create/edit/delete projects

### Reports
✅ **Limited Access**
- View bugs they reported
- See testing metrics

---

## 📊 Detailed Permission Matrix

| Feature | Admin | Manager | Developer | Tester |
|---------|-------|---------|-----------|--------|
| **Users** |
| Create User | ✅ | ❌ | ❌ | ❌ |
| View Users | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ |
| **Projects** |
| Create Project | ❌ | ✅ | ❌ | ❌ |
| View Projects | ✅ All | ✅ All | ✅ Assigned | ✅ Assigned |
| Edit Project | ❌ | ✅ | ❌ | ❌ |
| Delete Project | ❌ | ✅ | ❌ | ❌ |
| Assign Team | ❌ | ✅ | ❌ | ❌ |
| **Bugs** |
| Create Bug | ❌ | ❌ | ❌ | ✅ |
| View Bugs | ✅ All | ✅ All | ✅ Assigned | ✅ Reported |
| Edit Bug | ❌ | ❌ | ✅ Assigned | ❌ |
| Delete Bug | ✅ | ❌ | ❌ | ❌ |
| Update Status | ❌ | ❌ | ✅ | ✅ Verify* |
| Assign Bug | ✅ | ✅ | ❌ | ❌ |

*Testers can only verify (close/reopen) resolved bugs they reported
| **Reports** |
| View Reports | ✅ | ✅ | ✅ Own | ✅ Own |
| Analytics | ✅ | ✅ | ❌ | ❌ |

---

## 🎯 Key Differences Summary

### Admin vs Manager
- **Admin**: User management only, read-only for projects/bugs
- **Manager**: Full project management, read-only for bugs

### Manager vs Developer
- **Manager**: Manages projects and teams, views and assigns all bugs
- **Developer**: Works on assigned bugs, no project management

### Developer vs Tester
- **Developer**: Can update bug status, works on fixes
- **Tester**: Creates bugs, cannot change status

---

## 🔧 Backend Implementation

### Bug Routes (`backend/routes/bugRoutes.js`)
```javascript
// View - All authenticated users
GET /api/bugs
GET /api/bugs/:id
GET /api/bugs/stats

// Create - Testers and Developers only
POST /api/bugs (authorize: tester, developer)

// Update - Testers and Developers only
PUT /api/bugs/:id (authorize: tester, developer)

// Delete - Admin only
DELETE /api/bugs/:id (authorize: admin)

// Assign - Admin and Manager
PUT /api/bugs/:id/assign (authorize: admin, manager)
```

### Project Routes (`backend/routes/projectRoutes.js`)
```javascript
// View - All authenticated users
GET /api/projects
GET /api/projects/:id

// Manage - Managers only
POST /api/projects (authorize: manager)
PUT /api/projects/:id (authorize: manager)
DELETE /api/projects/:id (authorize: manager)
POST /api/projects/:id/team (authorize: manager)
DELETE /api/projects/:id/team/:userId (authorize: manager)
```

### User Routes (`backend/routes/userRoutes.js`)
```javascript
// Manage - Admin only
GET /api/users (authorize: admin)
POST /api/users (authorize: admin)
PUT /api/users/:id (authorize: admin)
DELETE /api/users/:id (authorize: admin)
```

---

## 🎨 Frontend Implementation

### UI Restrictions

#### BugsPage.js
- **Report Bug Button**: Visible only to Testers & Developers
- **Edit Bug Button**: Visible only to Testers & Developers
- **Status Dropdown**: Visible only to Developers
- **Assign Button**: Visible only to Managers
- **View Only Badge**: Displayed for Admins only

#### ProjectsPage.js
- **Create Project Button**: Visible only to Managers
- **Edit/Delete Buttons**: Visible only to Managers
- **Add Team Member**: Visible only to Managers
- **View Only Button**: Displayed for Admins

#### UsersPage.js
- **Full CRUD Interface**: Visible only to Admins
- **Other roles**: No access to this page

---

## 📧 Email Notifications

### Project Assignments (Manager action)
- Triggered when manager assigns team member
- Optional toggle in UI
- Email includes: Project name, role, link to project

### Bug Assignments (Admin/Manager action)
- Triggered when admin or manager assigns bug to developer/tester
- Optional email notification (toggleable)
- Email includes: Bug title, project, link to bug

### Bug Resolution
- Triggered when developer marks bug as resolved
- Notifies reporter (tester)
- Email includes: Bug title, resolver name, project

---

## 🚀 Testing Permissions

### Test Admin Access
1. Login as Admin
2. Verify Users page is accessible with full CRUD
3. Navigate to Projects - should see "View Only" buttons
4. Navigate to Bugs - should see "View Only" badge
5. Confirm cannot create/edit projects or bugs

### Test Manager Access
1. Login as Manager
2. Navigate to Manager Dashboard
3. Create a new project - should succeed
4. Assign team members - should succeed with email option
5. Navigate to Bugs page
6. Verify "Report New Bug" button is hidden
7. Verify "Assign" button is visible on each bug
8. Click Assign button and assign bug to developer/tester
9. Confirm email notification option works
10. Confirm cannot edit bug status or details

### Test Developer Access
1. Login as Developer
2. Should only see assigned bugs
3. Can update bug status via dropdown
4. Can edit bug details
5. Cannot access admin or manager features

### Test Tester Access
1. Login as Tester
2. Can report new bugs with screenshots
3. Should only see bugs they reported
4. Can edit their own bugs
5. Cannot change bug status to resolved/closed

---

## ⚠️ Important Notes

1. **Permission Enforcement**: Permissions are enforced at both frontend (UI) and backend (API) levels
2. **Security**: Backend authorization prevents unauthorized API calls even if frontend is bypassed
3. **Email Configuration**: Requires valid SMTP credentials in `.env` file
4. **Role Assignment**: Only Admin can change user roles
5. **Data Visibility**: Developers and Testers see limited data based on assignments

---

## 🎉 Summary

The Bug Tracker now has a comprehensive role-based access control system:
- ✅ Clear separation of concerns between roles
- ✅ Admin focuses on user management
- ✅ Manager handles project planning and team coordination
- ✅ Developers work on bug fixes
- ✅ Testers identify and report issues
- ✅ Both UI and API enforce permissions
- ✅ Email notifications for key actions
