# 🐛 Bug Tracker - MERN Stack Application

A beautiful, animated bug tracking web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring role-based dashboards, real-time notifications, and stunning animations using Framer Motion and Bootstrap 5.

## ✨ Features

### 🎬 Animated Intro/Landing Page
- 4 stunning slides with smooth transitions
- Framer Motion animations throughout
- Glowing buttons with pulse effects
- Background gradient animations
- Fully responsive design

### 🔐 Authentication System
- JWT-based authentication
- Role-based access control (Admin, Manager, Developer, Tester)
- Password reset via email (Nodemailer)
- Secure password hashing with bcryptjs

### 👥 User Management (Admin)
- Create, read, update, delete users
- Activate/deactivate accounts
- Role assignment
- User analytics

### 📋 Project Management (Manager)
- Create and manage projects
- Assign team members
- Track project progress
- Automated email notifications
- Progress visualization

### 🐞 Bug Tracking
- Create bugs with screenshots (Multer upload)
- Priority and severity levels
- Status tracking (Open, In Progress, Resolved, Closed)
- Bug assignment with email notifications
- Comment system with attachments

### 📊 Dashboard Analytics
- Animated statistics cards
- Chart.js visualizations
- Doughnut and Bar charts
- Real-time data updates
- Activity feed

### 💬 Communication
- Comment system for bugs
- Email notifications for:
  - Bug assignments
  - Project assignments
  - Bug resolution
  - Password resets

### 🎨 UI/UX
- Bootstrap 5 framework
- Framer Motion animations
- Glassmorphism effects
- Smooth page transitions
- Animated sidebars and modals
- Responsive design
- Dark mode ready

## 🚀 Tech Stack

**Frontend:**
- React.js 18
- Bootstrap 5
- Framer Motion
- React Router v6
- Chart.js & React-Chartjs-2
- Axios
- Context API for state management

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcryptjs
- Multer (file uploads)
- Nodemailer (email service)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account for email service

### Step 1: Clone the Repository
```bash
cd C:\Users\yalak
cd bug-tracker
```

### Step 2: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bugtracker
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Gmail SMTP (Use App-Specific Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Bug Tracker <your-email@gmail.com>

FRONTEND_URL=http://localhost:3000

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

5. Start MongoDB (if local):
```bash
mongod
```

6. Run backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend:
```bash
cd C:\Users\yalak\bug-tracker\frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🎯 Usage

### First Time Setup

1. Navigate to `http://localhost:3000`
2. You'll see the animated landing page with 4 slides
3. Click "Get Started" to go to the login page
4. Click "Sign Up" to create an account
5. Select your role (Admin, Manager, Developer, Tester)
6. Login and explore your role-based dashboard

### Default Test Users

You can create test users with different roles:

**Admin:**
- Email: admin@bugtracker.com
- Password: admin123
- Role: Admin

**Manager:**
- Email: manager@bugtracker.com
- Password: manager123
- Role: Project Manager

**Developer:**
- Email: dev@bugtracker.com
- Password: dev123
- Role: Developer

**Tester:**
- Email: tester@bugtracker.com
- Password: tester123
- Role: Tester

### Role-Based Features

**Admin Dashboard:**
- View all users, projects, and bugs
- User management (CRUD operations)
- System analytics and charts
- Activity monitoring

**Manager Dashboard:**
- Create and manage projects
- Assign team members
- View project progress
- Bug oversight

**Developer Dashboard:**
- View assigned bugs
- Update bug status
- Comment on bugs
- Track work progress

**Tester Dashboard:**
- Report new bugs
- Upload screenshots
- Set priorities
- Track bug reports

## 📧 Email Configuration

### Gmail App Password Setup

1. Go to Google Account Settings
2. Security → 2-Step Verification → App Passwords
3. Generate a new app password
4. Use this password in `.env` file

## 🗂️ Project Structure

```
bug-tracker/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── bugController.js
│   │   └── commentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Bug.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── bugRoutes.js
│   │   └── commentRoutes.js
│   ├── utils/
│   │   └── emailService.js
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LandingPage.css
│   │   │   ├── LoginPage.js
│   │   │   ├── LoginPage.css
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ManagerDashboard.js
│   │   │   ├── DeveloperDashboard.js
│   │   │   └── TesterDashboard.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## 🎨 Key Features Showcase

### Animations
- **Landing Page**: Slide transitions, icon rotations, pulse effects
- **Login**: Glassmorphism, fade-ins, form animations
- **Dashboard**: Card hover effects, chart animations, staggered lists
- **Sidebar**: Slide-in navigation, active state animations
- **Modals**: Slide-down animations

### Design Elements
- **Glassmorphism**: Transparent, blurred backgrounds
- **Gradient Backgrounds**: Animated color shifts
- **Custom Bootstrap**: Themed components
- **Responsive**: Mobile-first design
- **Icons**: Bootstrap Icons throughout

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/toggle-active` - Activate/deactivate (Admin)
- `GET /api/users/role/:role` - Get users by role

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Manager/Admin)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/team` - Add team member
- `DELETE /api/projects/:id/team/:userId` - Remove team member

### Bugs
- `GET /api/bugs` - Get all bugs
- `GET /api/bugs/:id` - Get bug by ID
- `POST /api/bugs` - Create bug (with file upload)
- `PUT /api/bugs/:id` - Update bug
- `DELETE /api/bugs/:id` - Delete bug
- `PUT /api/bugs/:id/assign` - Assign bug
- `GET /api/bugs/stats` - Get bug statistics

### Comments
- `GET /api/comments/bug/:bugId` - Get bug comments
- `POST /api/comments/bug/:bugId` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP

### Email Not Sending
- Use Gmail app-specific password
- Enable 2FA on Google account
- Check firewall settings

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built with ❤️ using MERN Stack, Bootstrap 5, and Framer Motion

## 🙏 Acknowledgments

- Bootstrap 5 for the UI framework
- Framer Motion for amazing animations
- Chart.js for beautiful charts
- MongoDB, Express, React, Node.js communities

---

**Happy Bug Tracking! 🐛✨**
