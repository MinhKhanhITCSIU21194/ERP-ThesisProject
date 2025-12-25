# ERP System - HR Module Structure & Documentation

## 👥 HR Module Overview

The HR (Human Resources) module is a comprehensive employee management system that handles the complete employee lifecycle from onboarding to offboarding, including:

- **Employee Management** - CRUD operations, profiles, analytics
- **Department Management** - Organizational structure with hierarchies
- **Position Management** - Job positions with salary ranges and levels
- **Contract Management** - Employment contracts with lifecycle tracking
- **Leave Request Management** - Time-off requests with approval workflows
- **Employee Onboarding** - Secure setup process with email activation
- **Import/Export** - Bulk operations with Excel files
- **Reporting & Analytics** - Statistics, dashboards, and insights

---

## 📂 HR Module File Structure

```
back-end/src/
│
├── 🎯 models/entities/              # HR Data Models
│   ├── employee.ts                  ⭐ Core employee entity (304 lines)
│   │   ├── 50+ attributes (personal, contact, employment, bank info)
│   │   ├── Soft delete support (deletedAt)
│   │   ├── Setup token for onboarding
│   │   ├── Enums: EmploymentStatus, MaritalStatus, Gender
│   │   └── Relationships: User, Position, Departments, Contracts
│   │
│   ├── department.ts                ⭐ Department entity
│   │   ├── Hierarchical structure (parentId)
│   │   ├── Manager assignment
│   │   ├── Budget tracking (JSON)
│   │   └── Many-to-Many with Employee
│   │
│   ├── position.ts                  ⭐ Position/Job title entity
│   │   ├── Hierarchical structure (parentId)
│   │   ├── Position levels (INTERN to C_LEVEL)
│   │   ├── Salary ranges (min/max)
│   │   ├── Requirements & responsibilities (JSON)
│   │   └── Headcount tracking
│   │
│   ├── employee-department.ts       ⭐ Junction table entity
│   │   ├── Links employees to departments
│   │   ├── isPrimary flag
│   │   ├── isManager flag
│   │   ├── Role & responsibilities
│   │   └── Start/end date tracking
│   │
│   ├── contract.ts                  ⭐ Employment contract entity
│   │   ├── Contract types (FULL_TIME, PART_TIME, etc.)
│   │   ├── Working types (ONSITE, REMOTE, HYBRID)
│   │   ├── Contract status lifecycle
│   │   ├── Salary & work hours
│   │   ├── Start/end dates
│   │   └── Soft delete support
│   │
│   └── leave-request.ts             ⭐ Leave/time-off request entity
│       ├── Leave types (SICK, PERSONAL, VACATION, OTHER)
│       ├── Status workflow (PENDING → APPROVED/REJECTED)
│       ├── Approver tracking
│       ├── Half-day support (0.5, 1.0)
│       └── Total days calculation
│
├── 🛠️ services/                     # HR Business Logic
│   ├── employee.service.ts          ⭐ Employee operations (1089 lines)
│   │   ├── getEmployees() - Paginated list with filters
│   │   ├── getEmployeeById() - Single employee details
│   │   ├── getEmployeeByCode() - Lookup by employee code
│   │   ├── getEmployeeByEmail() - Lookup by email
│   │   ├── getEmployeeByUserId() - Link to user account
│   │   ├── createEmployee() - Create with email activation
│   │   ├── updateEmployee() - Update employee data
│   │   ├── deleteEmployee() - Soft delete with user deactivation
│   │   ├── restoreEmployee() - Restore soft-deleted
│   │   ├── validateSetupToken() - Onboarding token validation
│   │   ├── completeSetup() - Finish employee setup
│   │   ├── generateEmployeeCode() - Auto code generation
│   │   ├── sendSetupEmail() - Email activation link
│   │   ├── getEmployeeStatistics() - HR analytics
│   │   ├── getActiveEmployeesCount() - Count active staff
│   │   ├── getEmployeesWithExpiringContracts() - Contract alerts
│   │   ├── getEmployeesByDepartment() - Department roster
│   │   └── getEmployeesByManager() - Team members
│   │
│   ├── department.service.ts        ⭐ Department operations (390 lines)
│   │   ├── getAllDepartments() - List with filters
│   │   ├── getDepartmentById() - Single department
│   │   ├── getDepartmentHierarchy() - Tree structure
│   │   ├── createDepartment() - Create new department
│   │   ├── updateDepartment() - Update department
│   │   ├── deleteDepartment() - Soft delete
│   │   ├── hardDeleteDepartment() - Permanent delete
│   │   ├── getDepartmentEmployees() - List employees
│   │   ├── addEmployeeToDepartment() - Assign employee
│   │   ├── removeEmployeeFromDepartment() - Unassign
│   │   ├── getDepartmentStats() - Department analytics
│   │   └── moveEmployees() - Bulk transfer
│   │
│   ├── position.service.ts          ⭐ Position operations (443 lines)
│   │   ├── getAllPositions() - List with filters
│   │   ├── getPositionById() - Single position
│   │   ├── getPositionHierarchy() - Position tree
│   │   ├── getPositionsByLevel() - Filter by level
│   │   ├── getPositionsBySalaryRange() - Salary filter
│   │   ├── createPosition() - Create position
│   │   ├── updatePosition() - Update position
│   │   ├── deletePosition() - Soft delete
│   │   ├── hardDeletePosition() - Permanent delete
│   │   ├── getPositionEmployees() - List employees
│   │   ├── getPositionStats() - Position analytics
│   │   └── updateAllHeadcounts() - Sync headcounts
│   │
│   ├── contract.service.ts          ⭐ Contract operations (273 lines)
│   │   ├── getContracts() - Paginated list with filters
│   │   ├── getContractById() - Single contract
│   │   ├── getContractsByEmployeeId() - Employee history
│   │   ├── createContract() - Create contract
│   │   ├── updateContract() - Update contract
│   │   ├── deleteContract() - Soft delete
│   │   ├── restoreContract() - Restore deleted
│   │   ├── getStatistics() - Contract analytics
│   │   └── getExpiringContracts() - Expiry alerts
│   │
│   └── leave-request.service.ts     ⭐ Leave request operations (339 lines)
│       ├── createLeaveRequest() - Submit leave request
│       ├── getLeaveRequestById() - Single request
│       ├── getMyLeaveRequests() - Employee's requests
│       ├── getLeaveRequestsToApprove() - Manager queue
│       ├── approveLeaveRequest() - Approve with notification
│       ├── rejectLeaveRequest() - Reject with reason
│       ├── cancelLeaveRequest() - Cancel by employee
│       ├── updateLeaveRequest() - Update pending request
│       ├── getApprovers() - List of approvers
│       └── calculateTotalDays() - Leave days calculator
│
├── 🎮 controllers/                  # HR Request Handlers
│   ├── employee.controller.ts       ⭐ Employee endpoints (583 lines)
│   │   ├── getEmployees - GET /api/employees
│   │   ├── getEmployeeById - GET /api/employees/:id
│   │   ├── getEmployeeByCode - GET /api/employees/code/:code
│   │   ├── createEmployee - POST /api/employees
│   │   ├── updateEmployee - PUT /api/employees/:id
│   │   ├── deleteEmployee - DELETE /api/employees/:id
│   │   ├── getStatistics - GET /api/employees/statistics
│   │   ├── getExpiringContracts - GET /api/employees/expiring-contracts
│   │   ├── getEmployeesByDepartment - GET /api/employees/department/:id
│   │   ├── getEmployeesByManager - GET /api/employees/manager/:id
│   │   ├── exportEmployees - GET /api/employees/export
│   │   └── importEmployees - POST /api/employees/import
│   │
│   ├── employee-setup.controller.ts ⭐ Onboarding endpoints (157 lines)
│   │   ├── validateSetupToken - GET /api/employee-setup/validate/:token
│   │   ├── completeSetup - POST /api/employee-setup/complete/:token
│   │   └── resendSetupEmail - POST /api/employee-setup/resend/:employeeId
│   │
│   ├── department.controller.ts     ⭐ Department endpoints
│   │   ├── getAllDepartments - GET /api/departments
│   │   ├── getDepartmentById - GET /api/departments/:id
│   │   ├── getDepartmentHierarchy - GET /api/departments/hierarchy
│   │   ├── createDepartment - POST /api/departments
│   │   ├── updateDepartment - PUT /api/departments/:id
│   │   ├── deleteDepartment - DELETE /api/departments/:id
│   │   ├── hardDeleteDepartment - DELETE /api/departments/:id/hard
│   │   ├── getDepartmentEmployees - GET /api/departments/:id/employees
│   │   ├── getDepartmentStats - GET /api/departments/:id/stats
│   │   └── moveEmployees - POST /api/departments/move-employees
│   │
│   ├── position.controller.ts       ⭐ Position endpoints
│   │   ├── getAllPositions - GET /api/positions
│   │   ├── getPositionById - GET /api/positions/:id
│   │   ├── getPositionHierarchy - GET /api/positions/hierarchy
│   │   ├── getPositionsByLevel - GET /api/positions/by-level/:level
│   │   ├── getPositionsBySalaryRange - GET /api/positions/by-salary
│   │   ├── createPosition - POST /api/positions
│   │   ├── updatePosition - PUT /api/positions/:id
│   │   ├── deletePosition - DELETE /api/positions/:id
│   │   ├── hardDeletePosition - DELETE /api/positions/:id/hard
│   │   ├── getPositionEmployees - GET /api/positions/:id/employees
│   │   ├── getPositionStats - GET /api/positions/:id/stats
│   │   └── updateAllHeadcounts - POST /api/positions/update-headcounts
│   │
│   ├── contract.controller.ts       ⭐ Contract endpoints
│   │   ├── getContracts - GET /api/contracts
│   │   ├── getContractById - GET /api/contracts/:id
│   │   ├── getContractsByEmployeeId - GET /api/contracts/employee/:id
│   │   ├── createContract - POST /api/contracts
│   │   ├── updateContract - PUT /api/contracts/:id
│   │   ├── deleteContract - DELETE /api/contracts/:id
│   │   ├── restoreContract - POST /api/contracts/:id/restore
│   │   ├── getStatistics - GET /api/contracts/statistics
│   │   └── getExpiringContracts - GET /api/contracts/expiring
│   │
│   └── leave-request.controller.ts  ⭐ Leave request endpoints
│       ├── createLeaveRequest - POST /api/leave-requests
│       ├── getLeaveRequestById - GET /api/leave-requests/:id
│       ├── getMyLeaveRequests - GET /api/leave-requests/my-requests
│       ├── getLeaveRequestsToApprove - GET /api/leave-requests/to-approve
│       ├── approveLeaveRequest - PATCH /api/leave-requests/:id/approve
│       ├── rejectLeaveRequest - PATCH /api/leave-requests/:id/reject
│       ├── cancelLeaveRequest - PATCH /api/leave-requests/:id/cancel
│       └── getApprovers - GET /api/leave-requests/approvers
│
├── 🌐 routes/                       # HR API Routes
│   ├── employees.ts                 ⭐ Employee routes (164 lines)
│   ├── employee-setup.ts            ⭐ Onboarding routes
│   ├── departments.ts               ⭐ Department routes (80 lines)
│   ├── positions.ts                 ⭐ Position routes (84 lines)
│   ├── contracts.ts                 ⭐ Contract routes (110 lines)
│   └── leave-requests.ts            ⭐ Leave request routes (32 lines)
│
└── 🔐 middleware/                   # HR Security
    ├── auth.middleware.ts           - Authentication required
    └── permission.middleware.ts     - RBAC permission checks
        ├── EMPLOYEE_MANAGEMENT
        ├── DEPARTMENT_MANAGEMENT
        ├── POSITION_MANAGEMENT
        ├── CONTRACT_MANAGEMENT
        └── LEAVE_REQUEST_MANAGEMENT
```

---

## 🎯 HR Module Features

### 1. Employee Management

#### **Core Operations**
- ✅ **CRUD Operations** - Create, Read, Update, Delete (soft delete)
- ✅ **Bulk Import/Export** - Excel file support
- ✅ **Advanced Search** - Name, email, code, department, position
- ✅ **Pagination** - Efficient data loading
- ✅ **Filtering** - By status, department, position, hire date
- ✅ **Sorting** - Custom field sorting

#### **Employee Attributes** (50+ fields)
```typescript
// Basic Information
firstName, lastName, middleName
dateOfBirth, gender, maritalStatus
nationality, nationalId, passportNumber

// Contact Information
email, phoneNumber
emergencyContactNumber, emergencyContactName, emergencyContactRelationship

// Address Information
currentAddress, permanentAddress
city, state, postalCode, country

// Employment Information
employeeCode (auto-generated)
hireDate, confirmationDate, terminationDate
employmentStatus (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED, RESIGNED, RETIRED)
positionId, jobTitle, workLocation
reportingManagerId, suggestedRole
weeklyWorkHours (default: 40)
salary, salaryCurrency, salaryFrequency

// Bank Information
bankName, bankAccountNumber
bankAccountHolderName, bankBranchCode

// Health & Personal
bloodGroup, medicalConditions, allergies
profilePicture

// Skills & Qualifications
skills (JSON array)
qualifications (JSON array)

// Setup & Onboarding
setupToken, setupTokenExpiry
hasCompletedSetup

// Audit Trail
createdBy, updatedBy
createdAt, updatedAt, deletedAt
```

#### **Employee Operations**

```typescript
// List Employees
GET /api/employees
Query: pageIndex, pageSize, sortBy, sortOrder, search, 
       employmentStatus, departmentId, positionId, 
       hireDateFrom, hireDateTo, reportingManagerId

// Get Single Employee
GET /api/employees/:id
GET /api/employees/code/:code

// Create Employee
POST /api/employees
Body: CreateEmployeeDTO (only firstName, lastName, email required)
Actions:
  1. Generate employee code (auto-increment)
  2. Generate setup token (2-week expiry)
  3. Send activation email
  4. Create employee record
  5. Link to departments
  6. Return employee data

// Update Employee
PUT /api/employees/:id
Body: UpdateEmployeeDTO (partial update)
Validation: Check email/code uniqueness

// Delete Employee (Soft Delete)
DELETE /api/employees/:id
Actions:
  1. Set deletedAt timestamp
  2. Deactivate linked user account
  3. Preserve data for audit

// Statistics
GET /api/employees/statistics
Returns:
  - Total employees
  - Active/Inactive counts
  - By department breakdown
  - By position breakdown
  - By contract type
  - Recent hires
  - Terminations

// Expiring Contracts
GET /api/employees/expiring-contracts?days=30
Returns: Employees with contracts expiring in X days

// Department Roster
GET /api/employees/department/:departmentId

// Manager's Team
GET /api/employees/manager/:managerId

// Export to Excel
GET /api/employees/export
Format: .xlsx with all employee data

// Import from Excel
POST /api/employees/import
Upload: Excel file (.xlsx)
Actions:
  1. Parse file
  2. Validate data
  3. Create employees
  4. Send activation emails
  5. Return success/error report
```

---

### 2. Employee Onboarding System

#### **Secure Setup Process**

```typescript
// Step 1: Admin creates employee
POST /api/employees
{
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@company.com",
  // ... other fields
}

// System generates:
setupToken: "64-character-hex-token"
setupTokenExpiry: Date (2 weeks from creation)

// Step 2: Email sent automatically
Subject: "Welcome to [Company] - Complete Your Profile Setup"
Body: Link to setup page with token
Link: https://app.company.com/auth/employee-setup/{token}

// Step 3: Employee clicks link
GET /api/employee-setup/validate/:token
Response: Employee basic info (if valid)

// Step 4: Employee completes setup
POST /api/employee-setup/complete/:token
{
  password: "SecurePassword123!",
  // ... additional profile info
}

Actions:
  1. Validate token (not expired, not used)
  2. Create user account with password
  3. Link user to employee
  4. Mark hasCompletedSetup = true
  5. Invalidate setup token
  6. Send welcome notification
  7. Auto-login (return session tokens)

// Step 5: Employee logs in
POST /auth/sign-in
{
  email: "john.doe@company.com",
  password: "SecurePassword123!"
}
```

#### **Onboarding Features**
- ✅ **Time-limited tokens** - 2-week expiry
- ✅ **Email activation** - Secure link delivery
- ✅ **One-time setup** - Token invalidated after use
- ✅ **Auto user creation** - Seamless account linking
- ✅ **Role assignment** - Based on position/department
- ✅ **Resend email** - If token expires or email lost
- ✅ **Token validation** - Prevent unauthorized access

---

### 3. Department Management

#### **Hierarchical Structure**
```
Company
├── Engineering
│   ├── Frontend Team
│   ├── Backend Team
│   └── DevOps Team
├── Sales
│   ├── Regional Sales
│   └── Enterprise Sales
├── Human Resources
└── Finance
    ├── Accounting
    └── Payroll
```

#### **Department Features**
- ✅ **Hierarchical Organization** - Parent/child relationships
- ✅ **Manager Assignment** - Department heads
- ✅ **Budget Tracking** - JSON-based budget data
- ✅ **Location Management** - Physical office locations
- ✅ **Department Codes** - Unique identifiers
- ✅ **Employee Count** - Auto-calculated headcount
- ✅ **Department Transfer** - Move employees between departments

#### **Department Operations**

```typescript
// List Departments
GET /api/departments
Query: isActive, search, parentId

// Get Department Hierarchy
GET /api/departments/hierarchy
Returns: Tree structure with nested departments

// Get Department Details
GET /api/departments/:id

// Create Department
POST /api/departments
{
  name: "Engineering",
  description: "Technology and Development",
  parentId: null, // Root department
  managerId: "uuid-of-manager",
  code: "ENG",
  location: "Building A, Floor 3",
  budget: { yearly: 1000000, currency: "USD" },
  isActive: true
}

// Update Department
PUT /api/departments/:id

// Delete Department
DELETE /api/departments/:id (soft delete)
DELETE /api/departments/:id/hard (permanent)

// Get Department Employees
GET /api/departments/:id/employees
Returns: List of employees in department

// Get Department Statistics
GET /api/departments/:id/stats
Returns:
  - Total employees
  - By position breakdown
  - By contract type
  - Active/inactive counts

// Move Employees
POST /api/departments/move-employees
{
  fromDepartmentId: "uuid",
  toDepartmentId: "uuid",
  employeeIds: ["uuid1", "uuid2"]
}
```

---

### 4. Position Management

#### **Position Hierarchy**
```
C-Level Positions
├── CEO
├── CTO
│   ├── Engineering Director
│   │   ├── Engineering Manager
│   │   │   ├── Senior Engineer
│   │   │   ├── Engineer
│   │   │   └── Junior Engineer
│   │   └── Tech Lead
│   └── Principal Engineer
└── CFO
    └── Finance Manager
        ├── Senior Accountant
        └── Accountant
```

#### **Position Levels**
```typescript
enum PositionLevel {
  INTERN = "INTERN",
  JUNIOR = "JUNIOR",
  INTERMEDIATE = "INTERMEDIATE",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
  PRINCIPAL = "PRINCIPAL",
  MANAGER = "MANAGER",
  SENIOR_MANAGER = "SENIOR_MANAGER",
  DIRECTOR = "DIRECTOR",
  SENIOR_DIRECTOR = "SENIOR_DIRECTOR",
  VP = "VP",
  SVP = "SVP",
  C_LEVEL = "C_LEVEL"
}
```

#### **Position Features**
- ✅ **Hierarchical Structure** - Career progression paths
- ✅ **Salary Ranges** - Min/max salary per position
- ✅ **Position Levels** - 13 career levels
- ✅ **Requirements** - Skills, education, experience (JSON)
- ✅ **Responsibilities** - Job duties (JSON)
- ✅ **Headcount Tracking** - Available positions
- ✅ **Position Codes** - Unique identifiers

#### **Position Operations**

```typescript
// List Positions
GET /api/positions
Query: isActive, level, search, parentId, minSalary, maxSalary

// Get Position Hierarchy
GET /api/positions/hierarchy
Returns: Tree structure with career paths

// Filter by Level
GET /api/positions/by-level/:level
Example: /api/positions/by-level/SENIOR

// Filter by Salary Range
GET /api/positions/by-salary?min=50000&max=100000

// Get Position Details
GET /api/positions/:id

// Create Position
POST /api/positions
{
  name: "Senior Software Engineer",
  description: "Lead technical projects and mentor junior developers",
  level: "SENIOR",
  parentId: "uuid-of-engineering-manager",
  minSalary: 80000,
  maxSalary: 120000,
  salaryCurrency: "USD",
  code: "SSE",
  requirements: {
    education: "Bachelor's in CS or equivalent",
    experience: "5+ years",
    skills: ["JavaScript", "React", "Node.js"]
  },
  responsibilities: [
    "Design and implement features",
    "Code reviews",
    "Mentor junior developers"
  ],
  headcount: 5,
  isActive: true
}

// Update Position
PUT /api/positions/:id

// Delete Position
DELETE /api/positions/:id (soft delete)
DELETE /api/positions/:id/hard (permanent)

// Get Position Employees
GET /api/positions/:id/employees

// Get Position Statistics
GET /api/positions/:id/stats
Returns:
  - Total employees
  - Available headcount
  - Filled positions
  - Average salary

// Update All Headcounts
POST /api/positions/update-headcounts
Action: Recalculate headcounts for all positions
```

---

### 5. Contract Management

#### **Contract Types**
```typescript
enum ContractType {
  FULL_TIME = "FULL_TIME",       // Permanent full-time
  PART_TIME = "PART_TIME",       // Permanent part-time
  CONTRACT = "CONTRACT",         // Fixed-term contractor
  INTERNSHIP = "INTERNSHIP",     // Intern/trainee
  TEMPORARY = "TEMPORARY",       // Temporary worker
  FREELANCE = "FREELANCE"        // Freelance/consultant
}

enum WorkingType {
  ONSITE = "ONSITE",             // Office-based
  REMOTE = "REMOTE",             // Fully remote
  HYBRID = "HYBRID"              // Mix of office and remote
}

enum ContractStatus {
  PENDING = "PENDING",           // Not yet started
  ACTIVE = "ACTIVE",             // Currently active
  EXPIRED = "EXPIRED",           // Contract ended
  TERMINATED = "TERMINATED"      // Early termination
}
```

#### **Contract Features**
- ✅ **Multiple Contracts** - Track employment history
- ✅ **Contract Lifecycle** - Status transitions
- ✅ **Expiry Tracking** - Automatic alerts
- ✅ **Salary Management** - Per-contract salary
- ✅ **Work Schedule** - Weekly hours, frequency
- ✅ **Contract Files** - Document storage
- ✅ **Terms & Conditions** - Contract clauses
- ✅ **Soft Delete** - Historical data preservation

#### **Contract Operations**

```typescript
// List Contracts
GET /api/contracts
Query: pageIndex, pageSize, sortBy, sortOrder,
       contractType, workingType, status, employeeId

// Get Contract Details
GET /api/contracts/:id

// Get Employee's Contracts
GET /api/contracts/employee/:employeeId
Returns: Full employment history

// Create Contract
POST /api/contracts
{
  contractNumber: "EMP-2025-001", // Auto-generated if not provided
  employeeId: "uuid",
  contractType: "FULL_TIME",
  workingType: "HYBRID",
  status: "ACTIVE",
  startDate: "2025-01-01",
  endDate: "2026-12-31", // Optional
  salary: 75000,
  salaryCurrency: "USD",
  salaryFrequency: "MONTHLY",
  weeklyWorkHours: 40,
  contractFile: "path/to/signed-contract.pdf",
  terms: "Standard employment terms...",
  notes: "Negotiated extra vacation days"
}

// Update Contract
PUT /api/contracts/:id

// Delete Contract
DELETE /api/contracts/:id (soft delete)

// Restore Contract
POST /api/contracts/:id/restore

// Get Contract Statistics
GET /api/contracts/statistics
Returns:
  - Total contracts
  - By type breakdown
  - By working type
  - By status
  - Active contracts
  - Expiring soon

// Get Expiring Contracts
GET /api/contracts/expiring?days=30
Returns: Contracts expiring in X days
Action: Send renewal reminders
```

---

### 6. Leave Request Management

#### **Leave Types**
```typescript
enum LeaveType {
  SICK = "SICK",             // Sick leave
  PERSONAL = "PERSONAL",     // Personal days
  VACATION = "VACATION",     // Vacation/holiday
  OTHER = "OTHER"            // Other types
}

enum LeaveRequestStatus {
  PENDING = "PENDING",       // Awaiting approval
  APPROVED = "APPROVED",     // Approved by manager
  REJECTED = "REJECTED",     // Rejected by manager
  CANCELLED = "CANCELLED"    // Cancelled by employee
}
```

#### **Leave Request Features**
- ✅ **Multiple Leave Types** - Sick, personal, vacation
- ✅ **Approval Workflow** - Manager approval required
- ✅ **Half-Day Support** - 0.5 or 1.0 day increments
- ✅ **Reason Tracking** - Why leave is needed
- ✅ **Approver Comments** - Approval/rejection notes
- ✅ **Status Tracking** - Pending → Approved/Rejected
- ✅ **Notifications** - Real-time status updates
- ✅ **Calendar Integration** - Date range selection

#### **Leave Request Operations**

```typescript
// Create Leave Request
POST /api/leave-requests
{
  employeeId: "uuid",
  startDate: "2025-12-24",
  endDate: "2025-12-26",
  leavePeriodStartDate: 1.0,  // Full day
  leavePeriodEndDate: 0.5,    // Half day
  totalDays: 2.5,             // Auto-calculated
  leaveType: "VACATION",
  reason: "Family vacation",
  approverId: "uuid-of-manager"
}
Action:
  1. Validate dates
  2. Check leave balance (if applicable)
  3. Create request
  4. Notify approver
  5. Return request data

// Get My Leave Requests
GET /api/leave-requests/my-requests
Returns: All requests by logged-in employee

// Get Requests to Approve
GET /api/leave-requests/to-approve
Returns: Pending requests for manager

// Get Leave Request Details
GET /api/leave-requests/:id

// Approve Leave Request
PATCH /api/leave-requests/:id/approve
{
  approverComment: "Approved. Enjoy your vacation!"
}
Actions:
  1. Check approver authority
  2. Update status to APPROVED
  3. Set approvedAt timestamp
  4. Notify employee
  5. Update calendar

// Reject Leave Request
PATCH /api/leave-requests/:id/reject
{
  approverComment: "Sorry, team is understaffed this week."
}
Actions:
  1. Check approver authority
  2. Update status to REJECTED
  3. Notify employee

// Cancel Leave Request
PATCH /api/leave-requests/:id/cancel
Action: Employee cancels own request (if pending)

// Get Approvers
GET /api/leave-requests/approvers
Returns: List of users who can approve requests
Filter: By department, position, or explicit approver role
```

---

## 🔄 HR Module Workflows

### 1. Employee Hiring Workflow

```
┌─────────────────┐
│  HR Admin       │
└────────┬────────┘
         │ 1. Create Employee
         ▼
┌─────────────────────────┐
│  employee.service.ts    │
│  - Generate code        │
│  - Generate setup token │
│  - Save employee        │
└────────┬────────────────┘
         │ 2. Send activation email
         ▼
┌─────────────────────────┐
│  Email Service          │
│  - Setup link with token│
└────────┬────────────────┘
         │ 3. Email received
         ▼
┌─────────────────────────┐
│  New Employee           │
│  - Click setup link     │
└────────┬────────────────┘
         │ 4. Validate token
         ▼
┌─────────────────────────┐
│  employee-setup         │
│  - Check expiry         │
│  - Show setup form      │
└────────┬────────────────┘
         │ 5. Complete setup
         ▼
┌─────────────────────────┐
│  auth.service.ts        │
│  - Create user account  │
│  - Set password         │
│  - Link to employee     │
│  - Create session       │
└────────┬────────────────┘
         │ 6. Auto-login
         ▼
┌─────────────────┐
│  Dashboard      │
│  (Employee View)│
└─────────────────┘
```

### 2. Leave Request Workflow

```
┌─────────────────┐
│  Employee       │
└────────┬────────┘
         │ 1. Submit leave request
         ▼
┌─────────────────────────┐
│  leave-request.service  │
│  - Validate dates       │
│  - Calculate days       │
│  - Create request       │
└────────┬────────────────┘
         │ 2. Notify approver
         ▼
┌─────────────────────────┐
│  Notification Service   │
│  - Send notification    │
└────────┬────────────────┘
         │ 3. Notification sent
         ▼
┌─────────────────┐
│  Manager        │
└────────┬────────┘
         │ 4. Review request
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Approve│ │Reject │
└───┬───┘ └───┬───┘
    │         │
    │         │ 5. Update status
    └────┬────┘
         ▼
┌─────────────────────────┐
│  leave-request.service  │
│  - Update status        │
│  - Add comment          │
│  - Set timestamp        │
└────────┬────────────────┘
         │ 6. Notify employee
         ▼
┌─────────────────────────┐
│  Notification Service   │
│  - Send result          │
└────────┬────────────────┘
         │ 7. Notification received
         ▼
┌─────────────────┐
│  Employee       │
│  (View Result)  │
└─────────────────┘
```

### 3. Department Transfer Workflow

```
┌─────────────────┐
│  HR Admin       │
└────────┬────────┘
         │ 1. Initiate transfer
         ▼
┌─────────────────────────┐
│  department.service     │
│  - Validate departments │
│  - Check permissions    │
└────────┬────────────────┘
         │ 2. Update employee_department
         ▼
┌─────────────────────────┐
│  EmployeeDepartment     │
│  - End date old dept    │
│  - Create new record    │
│  - Set isPrimary        │
└────────┬────────────────┘
         │ 3. Update employee
         ▼
┌─────────────────────────┐
│  Employee               │
│  - Update cache         │
│  - Update permissions   │
└────────┬────────────────┘
         │ 4. Notify stakeholders
         ▼
┌─────────────────────────┐
│  Notification Service   │
│  - Notify employee      │
│  - Notify old manager   │
│  - Notify new manager   │
└────────┬────────────────┘
         │ 5. Complete
         ▼
┌─────────────────┐
│  Success        │
└─────────────────┘
```

---

## 📊 HR Analytics & Reporting

### Employee Statistics
```typescript
GET /api/employees/statistics

Response:
{
  success: true,
  data: {
    totalEmployees: 250,
    activeEmployees: 240,
    inactiveEmployees: 10,
    byEmploymentStatus: {
      ACTIVE: 240,
      ON_LEAVE: 5,
      TERMINATED: 3,
      RESIGNED: 2
    },
    byDepartment: [
      { departmentId: "uuid", name: "Engineering", count: 80 },
      { departmentId: "uuid", name: "Sales", count: 60 },
      { departmentId: "uuid", name: "HR", count: 15 }
    ],
    byPosition: [
      { positionId: "uuid", name: "Software Engineer", count: 40 },
      { positionId: "uuid", name: "Sales Rep", count: 35 }
    ],
    byContractType: {
      FULL_TIME: 200,
      PART_TIME: 30,
      CONTRACT: 15,
      INTERNSHIP: 5
    },
    recentHires: 12, // Last 30 days
    upcomingConfirmations: 8, // Probation ending
    averageTenure: "2.5 years"
  }
}
```

### Contract Statistics
```typescript
GET /api/contracts/statistics

Response:
{
  success: true,
  data: {
    totalContracts: 270,
    activeContracts: 240,
    byContractType: {
      FULL_TIME: 200,
      PART_TIME: 30,
      CONTRACT: 20,
      INTERNSHIP: 10,
      TEMPORARY: 8,
      FREELANCE: 2
    },
    byWorkingType: {
      ONSITE: 120,
      REMOTE: 80,
      HYBRID: 40
    },
    byStatus: {
      PENDING: 15,
      ACTIVE: 240,
      EXPIRED: 10,
      TERMINATED: 5
    },
    expiringIn30Days: 8,
    expiringIn60Days: 15,
    expiringIn90Days: 22
  }
}
```

### Department Statistics
```typescript
GET /api/departments/:id/stats

Response:
{
  success: true,
  data: {
    departmentId: "uuid",
    name: "Engineering",
    totalEmployees: 80,
    activeEmployees: 78,
    byPosition: [
      { position: "Senior Engineer", count: 25 },
      { position: "Engineer", count: 35 },
      { position: "Junior Engineer", count: 18 }
    ],
    byContractType: {
      FULL_TIME: 75,
      PART_TIME: 3,
      INTERNSHIP: 2
    },
    managerId: "uuid",
    managerName: "John Smith",
    budget: {
      allocated: 5000000,
      spent: 4200000,
      remaining: 800000
    },
    subDepartments: 3,
    recentHires: 5
  }
}
```

---

## 🔐 HR Module Security

### RBAC Permissions

```typescript
// Employee Management Permissions
EMPLOYEE_MANAGEMENT: {
  canView: true/false,          // View employee list
  canRead: true/false,          // View employee details
  canCreate: true/false,        // Create employees
  canUpdate: true/false,        // Update employee data
  canDelete: true/false,        // Soft delete employees
  canViewSalary: true/false,    // View salary info
  canEditSalary: true/false,    // Edit salary info
  canImport: true/false,        // Import from Excel
  canExport: true/false,        // Export to Excel
}

// Department Management Permissions
DEPARTMENT_MANAGEMENT: {
  canView: true/false,
  canCreate: true/false,
  canUpdate: true/false,
  canDelete: true/false,
}

// Position Management Permissions
POSITION_MANAGEMENT: {
  canView: true/false,
  canCreate: true/false,
  canUpdate: true/false,
  canDelete: true/false,
}

// Contract Management Permissions
CONTRACT_MANAGEMENT: {
  canView: true/false,
  canCreate: true/false,
  canUpdate: true/false,
  canDelete: true/false,
}

// Leave Request Management Permissions
LEAVE_REQUEST_MANAGEMENT: {
  canView: true/false,          // View leave requests
  canSubmit: true/false,        // Submit own requests
  canApprove: true/false,       // Approve team requests
  canReject: true/false,        // Reject requests
  canCancel: true/false,        // Cancel requests
}
```

### Protected Routes Example

```typescript
// Employee Routes
router.get("/employees", 
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getEmployees
);

router.post("/employees",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canCreate"),
  employeeController.createEmployee
);

router.put("/employees/:id",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canUpdate"),
  employeeController.updateEmployee
);

router.delete("/employees/:id",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canDelete"),
  employeeController.deleteEmployee
);

// Salary operations - restricted permission
router.put("/employees/:id/salary",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canEditSalary"),
  employeeController.updateSalary
);

// Export - requires special permission
router.get("/employees/export",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canExport"),
  employeeController.exportEmployees
);
```

---

## 📱 Front-End Integration

### Front-End File Structure

```
front-end/src/pages/
│
├── 🔐 auth/employee-setup/
│   └── employee-setup.tsx           # Employee onboarding page
│       ├── Token validation
│       ├── Profile completion form
│       └── Password setup
│
├── 👥 dashboard/sections/HR/
│   ├── view/
│   │   ├── employee-list-view.tsx   # Main employee list
│   │   ├── employee/
│   │   │   ├── employee-info-view.tsx        # Employee details
│   │   │   ├── employee-contract-view.tsx    # Contract management
│   │   │   ├── employee-contract-form-view.tsx
│   │   │   └── employee-import-modal.tsx     # Bulk import
│   │   └── leave-request-view.tsx   # HR leave management
│   │
│   └── components/
│       ├── employee-form.tsx        # Create/Edit form
│       ├── employee-filters.tsx     # Search & filter
│       └── employee-stats.tsx       # Dashboard widgets
│
├── 📋 dashboard/sections/Admin/
│   ├── view/
│   │   ├── department-list-view.tsx
│   │   ├── department/
│   │   │   └── department-info-view.tsx
│   │   ├── position-list-view.tsx
│   │   └── position/
│   │       └── position-info-view.tsx
│   │
│   └── components/
│       ├── department-form.tsx
│       ├── department-tree.tsx      # Hierarchical view
│       ├── position-form.tsx
│       └── position-hierarchy.tsx
│
└── 👤 dashboard/sections/Employee/
    ├── view/
    │   └── employee-request-leave-view.tsx   # Self-service
    │
    └── components/
        ├── request-leave-view.tsx
        └── leave-requests-list-view.tsx
```

### API Integration Examples

```typescript
// Employee Service
export const employeeAPI = {
  // List employees
  getEmployees: (params) => 
    axios.get('/api/employees', { params }),
  
  // Get single employee
  getEmployee: (id) => 
    axios.get(`/api/employees/${id}`),
  
  // Create employee
  createEmployee: (data) => 
    axios.post('/api/employees', data),
  
  // Update employee
  updateEmployee: (id, data) => 
    axios.put(`/api/employees/${id}`, data),
  
  // Delete employee
  deleteEmployee: (id) => 
    axios.delete(`/api/employees/${id}`),
  
  // Export to Excel
  exportEmployees: (params) => 
    axios.get('/api/employees/export', { 
      params, 
      responseType: 'blob' 
    }),
  
  // Import from Excel
  importEmployees: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/api/employees/import', formData);
  },
  
  // Statistics
  getStatistics: () => 
    axios.get('/api/employees/statistics'),
};
```

---

## 🚀 HR Module Benefits

### For HR Administrators
✅ **Centralized Employee Data** - Single source of truth  
✅ **Automated Onboarding** - Email-based activation  
✅ **Bulk Operations** - Import/Export with Excel  
✅ **Advanced Analytics** - Real-time insights  
✅ **Compliance Tracking** - Contract expiry alerts  
✅ **Audit Trail** - Full change history  

### For Managers
✅ **Team Visibility** - View direct reports  
✅ **Leave Approval** - Streamlined workflow  
✅ **Department Management** - Organize teams  
✅ **Performance Tracking** - Employee analytics  

### For Employees
✅ **Self-Service Portal** - Update own information  
✅ **Leave Requests** - Easy submission  
✅ **Profile Management** - View and edit profile  
✅ **Contract Visibility** - View own contracts  

---

## 📈 HR Module Metrics

### Technical Metrics
- **Total Lines of Code**: ~4,000+ lines
- **API Endpoints**: 60+ endpoints
- **Database Tables**: 6 core tables
- **Services**: 5 major services
- **Controllers**: 5 controllers
- **Routes**: 6 route files
- **Features**: 50+ features

### Business Metrics
- **Employee Attributes**: 50+ fields
- **Search Filters**: 10+ filter types
- **Report Types**: 8+ analytics reports
- **Automation**: Email activation, notifications
- **Security**: RBAC with 30+ permissions
- **Data Export**: Excel format support
- **Bulk Operations**: Import/Export ready

---

## 🎯 Summary

The HR Module is a **comprehensive, production-ready employee management system** featuring:

✅ **Complete Employee Lifecycle** - Hire to retire  
✅ **Secure Onboarding** - Email-based activation  
✅ **Organizational Structure** - Departments & positions  
✅ **Contract Management** - Full lifecycle tracking  
✅ **Leave Management** - Approval workflows  
✅ **Analytics & Reporting** - Business intelligence  
✅ **Role-Based Security** - Granular permissions  
✅ **Bulk Operations** - Import/Export support  
✅ **Soft Delete** - Data preservation  
✅ **Audit Trail** - Full change tracking  

The module is **modular, scalable, and follows enterprise best practices** for HR management systems.
