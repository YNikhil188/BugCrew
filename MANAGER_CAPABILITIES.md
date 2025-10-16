# 👨‍💼 Project Manager Capabilities - Complete Guide

## Overview
Project Managers have comprehensive control over project planning, team coordination, and bug assignment. This document outlines all capabilities available to managers.

---

## 📋 Core Responsibilities

### 1. Project Management (Full Control)
- Create, edit, and delete projects
- Set project status, priority, and timeline
- Track project progress with visual indicators
- Manage project lifecycle from planning to completion

### 2. Team Assignment (Full Control)
- Assign developers to projects
- Assign testers to projects
- Define roles within projects (Developer, Tester, Lead)
- Remove team members from projects
- Send email notifications on assignment

### 3. Bug Management (View & Assign)
- View all bugs across all projects
- Assign bugs to developers for fixes
- Assign bugs to testers for verification
- Send email notifications on bug assignment
- Monitor bug status and priority
- ❌ **Cannot create, edit, or delete bugs**
- ❌ **Cannot change bug status**

---

## 🎯 Project Assignment Features

### Assigning Projects to Team Members

#### Step-by-Step Process
1. **Access Manager Dashboard**
   - Navigate to `/manager/dashboard`
   - View all active projects with team information

2. **Select Project**
   - Click the person+ icon on any project card
   - Or click "Edit" then manage team

3. **Choose Team Member**
   - Select from dropdown of developers and testers
   - View full details: Name, Email, Role

4. **Assign Role**
   - Developer: For implementation and bug fixes
   - Tester: For testing and quality assurance
   - Lead: For technical leadership

5. **Email Notification**
   - Toggle "Send email notification" checkbox
   - Email includes:
     - Project name
     - Assigned role
     - Direct link to project
     - Manager's action

6. **Confirm Assignment**
   - Click "Assign Member"
   - Team member appears on project card
   - Email sent (if enabled)

### Managing Team Members
- **View Current Team**: All members displayed with badges
- **Remove Member**: Click 'X' icon on member badge
- **Update Roles**: Remove and re-add with new role

---

## 🐛 Bug Assignment Features

### Assigning Bugs to Team Members

#### When to Assign Bugs
- **To Developers**: For bug fixes and resolution
- **To Testers**: For bug verification and retesting
- **Priority Cases**: Critical and high-priority bugs
- **Load Balancing**: Distribute work across team

#### Step-by-Step Process
1. **Access Bugs Page**
   - Navigate to `/bugs`
   - View all bugs across all projects

2. **Select Bug**
   - Review bug details, priority, and status
   - Click "Assign" button (green button with person+ icon)

3. **Choose Assignee**
   - Dropdown shows all developers and testers
   - Format: Name - Email (Role)
   - Select most appropriate team member

4. **Email Notification**
   - Toggle "Send email notification to assignee"
   - Email includes:
     - Bug title and description
     - Project name
     - Direct link to bug
     - Expected action

5. **Confirm Assignment**
   - Click "Assign Bug"
   - Bug status automatically changes to "in-progress"
   - Assignee receives email (if enabled)
   - Assignment visible on bug card

### Bug Assignment Best Practices
- **Match Skills**: Assign to developers with relevant expertise
- **Check Workload**: Review team workload chart in dashboard
- **Set Priorities**: Assign critical bugs first
- **Clear Communication**: Enable email for important assignments
- **Follow Up**: Monitor progress through dashboard

---

## 📊 Dashboard Features

### Visual Analytics
1. **Project Status Distribution** (Doughnut Chart)
   - See breakdown by status
   - Identify bottlenecks
   - Plan resource allocation

2. **Bug Priority Levels** (Bar Chart)
   - View critical bugs count
   - Prioritize assignments
   - Track bug resolution

3. **Team Workload** (Bar Chart)
   - See projects per team member
   - Balance workload
   - Identify overallocation

### Statistics Cards
- **Total Projects**: All projects under management
- **In Progress**: Active projects count
- **Team Members**: Available developers/testers
- **Open Bugs**: Unresolved bugs requiring attention

---

## 📧 Email Notification System

### Project Assignment Emails
**Sent To**: Assigned team member
**Triggered By**: Manager assigns member to project
**Contains**:
- Project name
- Assigned role in project
- Start date (if set)
- Direct link to project
- Manager's name

### Bug Assignment Emails
**Sent To**: Assigned developer/tester
**Triggered By**: Manager assigns bug
**Contains**:
- Bug title and ID
- Bug priority and severity
- Project name
- Steps to reproduce
- Direct link to bug
- Expected action

### Email Configuration
- **Optional**: Can disable per assignment
- **SMTP**: Configured via Gmail
- **Template**: Professional HTML with branding
- **Delivery**: Instant on assignment

---

## 🔄 Workflow Examples

### Example 1: New Project Setup
1. Create project in Manager Dashboard
2. Set timeline, priority, and goals
3. Assign lead developer
4. Assign additional developers
5. Assign testers for QA
6. Monitor progress through dashboard
7. Adjust team as needed

### Example 2: Critical Bug Response
1. View critical bug in Bugs page
2. Check team workload in dashboard
3. Select available developer
4. Assign bug with email notification
5. Track status change to "in-progress"
6. Monitor resolution in dashboard

### Example 3: Sprint Planning
1. Review all projects in dashboard
2. Check bug priority distribution
3. Assign high-priority bugs to team
4. Balance workload across developers
5. Assign testing tasks to testers
6. Monitor progress through charts

---

## 🎨 User Interface

### Manager Dashboard
**Location**: `/manager/dashboard`

**Features**:
- Project cards with progress bars
- Team member management
- Quick assign buttons
- Visual analytics
- Statistics overview

**Actions**:
- Create New Project (top-right button)
- Edit Project (edit button on card)
- Assign Team (person+ icon)
- Delete Project (trash icon)

### Bugs Page
**Location**: `/bugs`

**Features**:
- All bugs listed with details
- Priority and status badges
- Assignment information
- Quick assign button

**Actions**:
- Assign Bug (green "Assign" button)
- View Bug Details
- Filter by project (if implemented)

---

## 🔐 Permissions Summary

### ✅ What Managers CAN Do
- Create, edit, delete projects
- Assign projects to developers and testers
- Assign bugs to developers and testers
- View all projects and bugs
- Access reports and analytics
- Manage project teams
- Send email notifications

### ❌ What Managers CANNOT Do
- Create or edit bugs
- Delete bugs
- Change bug status
- Manage user accounts
- Modify user roles
- Access admin functions

---

## 🚀 API Endpoints Used

### Projects
```javascript
GET /api/projects                    // View all projects
POST /api/projects                   // Create project
PUT /api/projects/:id                // Update project
DELETE /api/projects/:id             // Delete project
POST /api/projects/:id/team          // Assign team member
DELETE /api/projects/:id/team/:userId // Remove team member
```

### Bugs
```javascript
GET /api/bugs                        // View all bugs
GET /api/bugs/:id                    // View bug details
PUT /api/bugs/:id/assign             // Assign bug
```

### Users (Read Only)
```javascript
GET /api/users                       // List developers/testers
```

---

## 💡 Tips for Effective Management

### Project Management
1. **Set Clear Timelines**: Use start and end dates
2. **Track Progress**: Update progress regularly
3. **Balance Teams**: Check workload chart before assigning
4. **Use Priorities**: Mark critical projects appropriately
5. **Enable Notifications**: Ensure team stays informed

### Bug Assignment
1. **Triage First**: Review all bugs before assigning
2. **Match Skills**: Assign based on expertise
3. **Communicate**: Use email for complex bugs
4. **Monitor Status**: Track through dashboard
5. **Follow Up**: Check resolution progress

### Team Coordination
1. **Regular Reviews**: Check dashboard daily
2. **Balance Workload**: Use workload chart
3. **Clear Roles**: Define expectations upfront
4. **Quick Response**: Assign critical bugs promptly
5. **Feedback Loop**: Monitor and adjust assignments

---

## 🎉 Summary

Project Managers are empowered to:
- ✅ **Plan**: Create and configure projects
- ✅ **Coordinate**: Assign work to developers and testers
- ✅ **Monitor**: Track progress through analytics
- ✅ **Communicate**: Send notifications and updates
- ✅ **Optimize**: Balance workload across team

This creates an efficient workflow where managers focus on planning and coordination, while developers and testers focus on execution and quality.
