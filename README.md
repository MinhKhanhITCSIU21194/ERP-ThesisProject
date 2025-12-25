# ERP System - Thesis Project

A full-stack Enterprise Resource Planning (ERP) web application featuring comprehensive Human Resources (HR) and Project Management modules with real-time notifications and advanced decision support.

## 🌟 Overview

This ERP system is designed to streamline organizational operations through integrated modules for employee management, project tracking, leave requests, contract management, and real-time communication. Built with modern web technologies, it provides a robust and scalable solution for enterprise resource planning.

## 🚀 Key Features

### HR Management Module

- Employee onboarding and profile management
- Department and position hierarchy
- Leave request workflow with approval system
- Contract management and tracking
- Role-based access control (RBAC)
- Employee skills and qualifications tracking

### Project Management Module

- Project creation and team assignment
- Task tracking and progress monitoring
- Resource allocation
- Project timeline management
- Real-time collaboration

### System Features

- Real-time notifications via Socket.IO
- Secure authentication with JWT
- Email notifications (Nodemailer)
- File upload and management (Multer)
- Excel import/export functionality
- RESTful API architecture
- Database migrations and seeding

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19.1.1
- **UI Library**: Material-UI (MUI) 7.3.1
- **State Management**: Redux Toolkit 2.9.0
- **Routing**: React Router 7.9.1
- **Build Tool**: Vite 7.3.0
- **Data Grid**: MUI X-Data-Grid
- **Drag & Drop**: DnD Kit
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.1.0
- **Database**: PostgreSQL with TypeORM 0.3.27
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.IO 4.8.1
- **Email**: Nodemailer
- **File Handling**: Multer 2.0.2
- **Excel Processing**: XLSX

## 📋 Prerequisites

- Node.js 18+ (LTS version recommended)
- PostgreSQL 12+
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**:

```bash
git clone https://github.com/MinhKhanhITCSIU21194/ERP-ThesisProject.git
cd "ERP System"
```

2. **Install root dependencies**:

```bash
npm install
```

3. **Setup Backend**:

```bash
cd back-end
npm install
```

Create a `.env` file in the `back-end` directory with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=erp_system
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

4. **Setup Frontend**:

```bash
cd ../front-end
npm install
```

## 🚦 Running the Application

### Backend Development Server

```bash
cd back-end
npm run dev          # Run with nodemon (hot reload)
npm run build        # Build TypeScript
npm start            # Run production build
```

### Database Operations

```bash
npm run migrate                    # Run migrations
npm run seed:complete             # Seed complete database
npm run seed:permissions          # Seed permissions only
npm run seed:projects             # Seed projects
npm run set:admin-permissions     # Set admin permissions
```

### Frontend Development Server

```bash
cd front-end
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📁 Project Structure

```
ERP System/
├── back-end/                      # Backend application
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # TypeORM entities
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, validation, error handling
│   │   ├── config/               # Database & app config
│   │   ├── migrations/           # Database migrations
│   │   ├── scripts/              # Seeding & utility scripts
│   │   ├── types/                # TypeScript types
│   │   └── app.ts                # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── front-end/                     # Frontend application
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── auth/            # Authentication pages
│   │   │   ├── dashboard/       # Dashboard pages
│   │   │   └── components/      # Shared components
│   │   ├── redux/                # Redux slices & store
│   │   ├── routes/               # React Router config
│   │   ├── services/             # API services
│   │   ├── context/              # React Context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── auth/                 # Authentication logic
│   │   ├── data/                 # Data models & types
│   │   ├── assets/               # Static assets
│   │   └── App.tsx               # Root component
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── package.json                   # Root workspace config
├── tsconfig.json                  # Root TypeScript config
└── README.md                      # This file
```

## 🔐 Authentication & Security

- JWT-based authentication with refresh tokens
- Password hashing using bcryptjs
- Role-based access control (RBAC)
- Permission-based middleware
- Rate limiting for API endpoints
- CORS configuration
- Secure cookie handling

## 📊 Database Schema

The system uses TypeORM with PostgreSQL and includes the following main entities:

- Users & Authentication
- Employees & Departments
- Positions & Roles
- Projects & Tasks
- Contracts
- Leave Requests
- Notifications
- Skills & Qualifications

## 🔄 API Endpoints

The backend provides RESTful APIs for:

- `/api/auth` - Authentication & authorization
- `/api/employees` - Employee management
- `/api/departments` - Department operations
- `/api/positions` - Position management
- `/api/projects` - Project operations
- `/api/contracts` - Contract management
- `/api/leave-requests` - Leave request workflow
- `/api/notifications` - Notification system
- `/api/roles` - Role management
- `/api/users` - User operations

## 👥 Author

**Minh Khanh**  
Student ID: ITCSIU21194  
International University - VNU HCMC

## 📄 License

This project is developed as part of a thesis project for academic purposes.

---

**Note**: This is an academic project. For production use, ensure proper security audits, environment configuration, and scalability testing.
