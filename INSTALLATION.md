# ERP System - Complete Installation Guide

This guide provides step-by-step instructions for installing and running the ERP System with all required dependencies and accurate module versions.

## 📋 System Requirements

- **Node.js**: v18.x or higher (LTS recommended)
- **PostgreSQL**: v12 or higher
- **npm**: v8.x or higher (comes with Node.js)
- **Operating System**: Windows, macOS, or Linux

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/MinhKhanhITCSIU21194/ERP-ThesisProject.git
cd "ERP System"
```

### 2. Install Root Dependencies

```bash
npm install
```

**Root Dependencies Installed:**
- `dayjs@^1.11.19` - Date handling library
- `vite@^7.3.0` (dev) - Build tool
- `@types/node@^25.0.3` (dev) - TypeScript types

---

## 🔧 Backend Setup

### 3. Install Backend Dependencies

```bash
cd back-end
npm install
```

### Backend Dependencies (48 total packages)

#### Core Runtime
- `express@^5.1.0` - Web framework
- `typeorm@^0.3.27` - ORM for database operations
- `pg@^8.16.3` - PostgreSQL driver
- `reflect-metadata@^0.2.2` - Required for TypeORM decorators

#### Authentication & Security
- `bcryptjs@^3.0.2` - Password hashing
- `jsonwebtoken@^9.0.2` - JWT token generation/validation
- `cookie-parser@^1.4.7` - Cookie handling middleware
- `cors@^2.8.5` - Cross-Origin Resource Sharing

#### Real-time & Communication
- `socket.io@^4.8.1` - Real-time bidirectional communication
- `nodemailer@^7.0.6` - Email sending functionality

#### File & Data Processing
- `multer@^2.0.2` - File upload handling
- `xlsx@^0.18.5` - Excel file processing

#### Utilities
- `dotenv@^17.2.2` - Environment variable management
- `node-cache@^5.1.2` - In-memory caching

#### Development Tools
- `typescript@^5.5.4` - TypeScript compiler
- `ts-node@^10.9.2` - TypeScript execution engine
- `nodemon@^3.1.4` - Development auto-reload
- `@types/bcryptjs@^3.0.0`
- `@types/cookie-parser@^1.4.7`
- `@types/cors@^2.8.17`
- `@types/express@^5.0.0`
- `@types/jsonwebtoken@^9.0.10`
- `@types/multer@^2.0.0`
- `@types/node@^22.5.4`
- `@types/node-cache@^4.2.5`
- `@types/nodemailer@^7.0.2`
- `@types/pg@^8.11.8`

### 4. Configure Backend Environment

Create a `.env` file in the `back-end` directory:

**Windows PowerShell:**
```powershell
New-Item -Path ".env" -ItemType File -Force
```

**Linux/macOS:**
```bash
touch .env
```

Add the following configuration to `back-end\.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=erp_system
DB_USERNAME=your_postgres_username

# JWT Configuration
JWT_SECRET=your_secure_random_jwt_secret_key_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_key_here

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

> **Note**: Replace the placeholder values with your actual credentials.

---

## 🎨 Frontend Setup

### 5. Install Frontend Dependencies

```bash
cd ../front-end
npm install
```

### Frontend Dependencies (62 total packages)

#### Core Framework
- `react@^19.1.1` - React library (latest version)
- `react-dom@^19.1.1` - React DOM bindings
- `react-router-dom@^7.9.1` - Client-side routing

#### UI Framework (Material-UI Ecosystem)
- `@mui/material@^7.3.1` - Core UI components
- `@mui/icons-material@^7.3.1` - Material Design icons
- `@mui/lab@^7.0.0-beta.16` - Experimental components
- `@mui/x-data-grid@^8.10.2` - Advanced data grid
- `@mui/x-date-pickers@^8.10.2` - Date/time pickers
- `@emotion/react@^11.14.0` - CSS-in-JS styling engine
- `@emotion/styled@^11.14.1` - Styled components

#### State Management
- `@reduxjs/toolkit@^2.9.0` - Redux state management
- `react-redux@^9.2.0` - React-Redux bindings

#### Drag & Drop (DnD Kit)
- `@dnd-kit/core@^6.3.1` - Core drag and drop functionality
- `@dnd-kit/sortable@^10.0.0` - Sortable items
- `@dnd-kit/modifiers@^9.0.0` - Drag modifiers
- `@dnd-kit/utilities@^3.2.2` - Utility functions

#### HTTP & Real-time Communication
- `axios@^1.12.2` - HTTP client for API calls
- `socket.io-client@^4.8.1` - WebSocket client

#### Additional Utilities
- `react-datepicker@^8.9.0` - Date picker component
- `file-saver@^2.0.5` - File download functionality
- `xlsx@^0.18.5` - Excel file processing
- `ajv@^8.17.1` - JSON schema validation
- `web-vitals@^2.1.4` - Performance metrics

#### Testing Libraries
- `@testing-library/react@^16.3.0`
- `@testing-library/jest-dom@^6.7.0`
- `@testing-library/dom@^10.4.1`
- `@testing-library/user-event@^13.5.0`

#### Build Tools & Development
- `vite@^7.1.5` - Fast frontend build tool
- `@vitejs/plugin-react@^4.0.0` - Vite React plugin
- `typescript@^4.9.5` - TypeScript compiler
- `@types/react@^19.1.11`
- `@types/react-dom@^19.1.8`
- `@types/react-redux@^7.1.34`
- `@types/react-beautiful-dnd@^13.1.8`
- `@types/file-saver@^2.0.7`
- `@types/node@^24.4.0`

### 6. Configure Frontend Environment (Optional)

Create a `.env` file in the `front-end` directory:

```bash
cd front-end
```

**Windows PowerShell:**
```powershell
New-Item -Path ".env" -ItemType File -Force
```

Add to `front-end\.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🗄️ Database Setup

### 7. Create PostgreSQL Database

**Connect to PostgreSQL:**

```bash
psql -U postgres
```

**Create the database:**

```sql
CREATE DATABASE erp_system;
\q
```

### 8. Run Database Migrations & Seed Data

Navigate to the backend directory and run:

```bash
cd back-end
npm run migrate
npm run seed:complete
```

**Additional Seeding Commands:**

```bash
npm run seed:permissions       # Seed permissions only
npm run seed:projects         # Seed project data
npm run set:admin-permissions # Configure admin permissions
```

---

## ▶️ Running the Application

### Backend Server

Open a terminal and run:

```bash
cd back-end
npm run dev    # Development mode with hot-reload
```

**Alternative commands:**
```bash
npm run build  # Build TypeScript to JavaScript
npm start      # Run production build
npm run build:watch  # Build with watch mode
```

**Backend runs on:** `http://localhost:5000`

### Frontend Server

Open another terminal and run:

```bash
cd front-end
npm run dev    # Development mode
```

**Alternative commands:**
```bash
npm run build   # Build for production
npm run preview # Preview production build
```

**Frontend runs on:** `http://localhost:5173` (Vite default port)

---

## 📊 Version Summary

| Component | Version |
|-----------|---------|
| **Runtime** | |
| Node.js | 18+ (LTS) |
| PostgreSQL | 12+ |
| **Frontend** | |
| React | 19.1.1 |
| TypeScript | 4.9.5 |
| Material-UI | 7.3.1 |
| Redux Toolkit | 2.9.0 |
| Vite | 7.1.5 |
| React Router | 7.9.1 |
| Axios | 1.12.2 |
| **Backend** | |
| Express | 5.1.0 |
| TypeScript | 5.5.4 |
| TypeORM | 0.3.27 |
| PostgreSQL (pg) | 8.16.3 |
| **Shared** | |
| Socket.IO | 4.8.1 |
| XLSX | 0.18.5 |

---

## 🧪 Testing the Installation

### Verify Backend

1. Backend should be running on `http://localhost:5000`
2. Check health endpoint: `http://localhost:5000/api/health` (if available)
3. Check for console errors in the terminal

### Verify Frontend

1. Frontend should open automatically at `http://localhost:5173`
2. You should see the login/authentication page
3. Check browser console for errors (F12)

### Verify Database

```bash
psql -U postgres -d erp_system -c "SELECT * FROM users LIMIT 1;"
```

---

## 🔧 Troubleshooting

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript compilation errors

```bash
# Rebuild TypeScript
cd back-end
npm run build
```

### Database connection fails

1. Verify PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux/macOS
   sudo systemctl status postgresql
   ```

2. Check credentials in `back-end\.env`
3. Ensure database `erp_system` exists
4. Verify PostgreSQL port (default: 5432)

### Port already in use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

**Frontend (5173):**
```bash
# Kill Vite process or change port in vite.config.ts
```

### Module not found errors

```bash
# Ensure all dependencies are installed
npm install

# Check if you're in the correct directory
pwd  # or 'cd' on Windows
```

---

## 📁 Project Structure Overview

```
ERP System/
├── back-end/                      # Backend application
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # TypeORM entities
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, validation, error handling
│   │   ├── config/               # Configuration files
│   │   ├── migrations/           # Database migrations
│   │   ├── scripts/              # Seeding & utility scripts
│   │   └── app.ts                # Application entry point
│   ├── .env                      # Environment variables (create this)
│   ├── package.json
│   └── tsconfig.json
│
├── front-end/                     # Frontend application
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── redux/                # Redux slices & store
│   │   ├── routes/               # React Router config
│   │   ├── services/             # API services
│   │   ├── context/              # React Context providers
│   │   └── App.tsx               # Root component
│   ├── .env                      # Environment variables (optional)
│   ├── package.json
│   └── vite.config.ts
│
├── package.json                   # Root workspace config
└── INSTALLATION.md               # This file
```

---

## 🔐 Default Credentials

After running `npm run seed:complete`, you can log in with:

- Check the console output after seeding for default admin credentials
- Or check the seeding script: `back-end/src/scripts/seed-complete-with-contracts.ts`

---

## 📝 Additional Commands

### Backend Scripts

```bash
npm run dev                    # Development with nodemon
npm run build                  # Compile TypeScript
npm run build:watch            # Compile with watch mode
npm start                      # Run production build
npm run migrate               # Run migrations
npm run seed:complete         # Complete database seeding
npm run seed:permissions      # Seed permissions only
npm run seed:projects         # Seed project data
npm run set:admin-permissions # Set admin permissions
```

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📧 Support

For issues or questions:
- Check existing issues on GitHub
- Review the main [README.md](README.md) file
- Contact: **Minh Khanh** (ITCSIU21194)

---

## ⚠️ Important Notes

1. **Security**: 
   - Never commit `.env` files to version control
   - Use strong, unique values for JWT secrets
   - Change default credentials in production

2. **Performance**:
   - Use `npm run build` for production deployments
   - Configure proper database indexes
   - Enable caching where appropriate

3. **Development**:
   - Use `npm run dev` for hot-reload during development
   - Check console logs for errors and warnings
   - Ensure all environment variables are set correctly

4. **Package Locks**:
   - The project uses `package-lock.json` files
   - These lock exact dependency versions
   - Running `npm install` will use these exact versions

---

## ✅ Installation Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Repository cloned
- [ ] Root dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`cd back-end && npm install`)
- [ ] Backend `.env` file created and configured
- [ ] Frontend dependencies installed (`cd front-end && npm install`)
- [ ] PostgreSQL database created (`erp_system`)
- [ ] Database migrations run (`npm run migrate`)
- [ ] Database seeded (`npm run seed:complete`)
- [ ] Backend server running (`npm run dev` in back-end)
- [ ] Frontend server running (`npm run dev` in front-end)
- [ ] Application accessible in browser

---

**Last Updated**: January 31, 2026  
**Project**: ERP System - Thesis Project  
**Author**: Minh Khanh (ITCSIU21194)
