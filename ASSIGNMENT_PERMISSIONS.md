# Assignment Permissions - Bug Tracker

## 🎯 Manager Assignment Rules

### Bug Assignment ✅
**Rule**: Managers can assign bugs **ONLY to developers**

**Why**: 
- Developers are responsible for fixing bugs
- Testers report bugs but don't fix them
- Clear separation of responsibilities

**Implementation**:
- **Frontend**: `BugsPage.js` filters users to show only developers in the assignment dropdown
- **Backend**: `bugController.js` validates that assigned user must have role `developer`
- **Error**: Returns `400 Bad Request` if attempting to assign bug to non-developer

**Code Location**:
```js
// Frontend: src/pages/BugsPage.js (line 62-69)
const fetchUsers = async () => {
  const res = await axios.get('/api/users');
  // Only fetch developers for bug assignment
  setUsers(res.data.filter(u => u.role === 'developer'));
};

// Backend: controllers/bugController.js (line 121-128)
const assignee = await User.findById(userId);
if (assignee.role !== 'developer') {
  return res.status(400).json({ 
    message: 'Bugs can only be assigned to developers' 
  });
}
```

---

### Project Assignment ✅
**Rule**: Managers can assign projects to **BOTH developers and testers**

**Why**: 
- Projects need both developers (to build) and testers (to test)
- Team collaboration requires both roles
- Testing is part of the project lifecycle

**Implementation**:
- **Frontend**: `ProjectsPage.js` shows both developers and testers in team assignment
- **Backend**: No role restriction on project team members
- **Flexibility**: Projects can have mixed teams

**Code Location**:
```js
// Frontend: src/pages/ProjectsPage.js
const fetchUsers = async () => {
  const res = await axios.get('/api/users');
  // Both developers and testers for project teams
  setUsers(res.data.filter(u => u.role === 'developer' || u.role === 'tester'));
};
```

---

## 📋 Complete Assignment Matrix

| What to Assign | Can Assign To | Manager Permission |
|----------------|---------------|-------------------|
| **Bugs** | Developers ONLY | ✅ Yes |
| **Bugs** | Testers | ❌ No |
| **Projects** | Developers | ✅ Yes |
| **Projects** | Testers | ✅ Yes |

---

## 🔐 Permission Enforcement

### Frontend Validation
- **Bugs Page**: Dropdown only shows developers
- **Projects Page**: Dropdown shows both developers and testers
- User-friendly interface prevents invalid selections

### Backend Validation
- **Bug Assignment Endpoint**: Validates role = 'developer'
- **Project Assignment Endpoint**: Accepts all team members
- Returns clear error messages for invalid assignments

---

## 🎭 Role Responsibilities

### Developer Role
- **Can be assigned**: Bugs ✅, Projects ✅
- **Primary work**: Fix bugs, build features
- **Dashboard**: Kanban board with assigned bugs
- **Project view**: See assigned projects and progress

### Tester Role
- **Can be assigned**: Bugs ❌, Projects ✅
- **Primary work**: Report bugs, test features
- **Dashboard**: Create bugs, verify fixes
- **Project view**: See assigned projects for testing

### Manager Role
- **Can assign**: 
  - Bugs → Developers only
  - Projects → Developers + Testers
- **Dashboard**: Team overview, workload distribution
- **Team Page**: View all team members and assignments

---

## 🚀 Workflow Examples

### Bug Workflow
1. **Tester** creates bug → Status: `open`
2. **Manager** assigns to **Developer** → Status: `in-progress`
3. **Developer** fixes and marks as resolved → Status: `resolved`
4. **Tester** verifies fix:
   - If good → Status: `closed` ✅
   - If bad → Status: `reopened` → Back to Developer

### Project Workflow
1. **Manager** creates project
2. **Manager** assigns team:
   - Add **Developers** (to build features)
   - Add **Testers** (to test features)
3. Team collaborates on project
4. Both roles see project in their dashboards

---

## 📧 Email Notifications

### Bug Assignment
- **Recipient**: Developer only (never tester)
- **When**: Manager assigns bug
- **Contains**: Bug title, project, priority
- **Action**: Developer can start working

### Project Assignment
- **Recipient**: Developer OR Tester (whoever is added)
- **When**: Manager adds team member to project
- **Contains**: Project name, role, deadline
- **Action**: Team member can view project

---

## ✅ Testing Checklist

### Bug Assignment
- [ ] Manager can see only developers in bug assignment dropdown
- [ ] Attempting to assign bug to tester returns error
- [ ] Developer receives email when bug assigned
- [ ] Bug appears in developer's Kanban board

### Project Assignment
- [ ] Manager can see both developers and testers in project team modal
- [ ] Both developers and testers can be added to project
- [ ] Project appears in assigned member's dashboard
- [ ] Team members can view project details

---

## 🔧 Configuration

### Environment Variables
```env
# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Email service configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### API Endpoints
```
PUT /api/bugs/:id/assign       # Assign bug (developers only)
PUT /api/projects/:id           # Update project team (developers + testers)
GET /api/users                  # Fetch all users (managers have access)
```

---

## 📝 Summary

**Key Points**:
1. ✅ Bugs → Developers only (backend + frontend validation)
2. ✅ Projects → Developers + Testers (flexible team building)
3. ✅ Clear role separation and responsibilities
4. ✅ Email notifications for assignments
5. ✅ User-friendly dropdowns prevent mistakes
6. ✅ Backend validation ensures data integrity

This configuration ensures a clear workflow where:
- **Developers fix bugs** (assigned by managers)
- **Testers test projects** (assigned by managers)
- **Both collaborate on projects** (assigned by managers)
- **Roles are clearly separated** with proper permissions
