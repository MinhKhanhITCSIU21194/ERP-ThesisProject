# Department and Position Management API

This document describes the new Department and Position management endpoints added to the ERP system.

## Overview

The system now includes comprehensive management for:

- **Departments**: Organizational units with hierarchical structure
- **Positions**: Job roles with salary ranges and levels
- **Employee-Department relationships**: Track employee assignments to departments

## Database Setup

### 1. Run TypeORM Migrations

Generate and run migrations for the new entities:

```bash
cd back-end
npm run typeorm migration:generate -- -n AddDepartmentPositionEntities
npm run typeorm migration:run
```

### 2. Seed Sample Data

```bash
# Seed departments and positions
psql -U postgres -d ERPThesis -f seed-departments-positions.sql

# Seed permissions
psql -U postgres -d ERPThesis -f seed-department-position-permissions.sql

# (Optional) Insert mock employees for testing
psql -U postgres -d ERPThesis -f mock-employees.sql
```

## Entities

### Department Entity

**Fields:**

- `id` (UUID): Primary key
- `name` (string): Department name
- `description` (text): Department description
- `parentId` (UUID): Reference to parent department
- `type` (enum): Department type (ENGINEERING, PRODUCT, DESIGN, etc.)
- `code` (string): Short department code (e.g., "ENG", "HR")
- `location` (string): Department location
- `managerId` (string): Employee ID of department manager
- `budget` (text): Budget details (can store JSON)
- `isActive` (boolean): Active status
- `createdBy`, `updatedBy`: Audit fields
- `createdAt`, `updatedAt`: Timestamps

**Department Types:**

- ENGINEERING
- PRODUCT
- DESIGN
- MARKETING
- SALES
- HUMAN_RESOURCES
- FINANCE
- OPERATIONS
- CUSTOMER_SUPPORT
- LEGAL
- SECURITY
- DATA_SCIENCE
- QUALITY_ASSURANCE
- BUSINESS
- ADMINISTRATION
- OTHER

### Position Entity

**Fields:**

- `id` (UUID): Primary key
- `name` (string): Position name
- `description` (text): Position description
- `level` (enum): Position level
- `parentId` (UUID): Reference to parent position
- `minSalary` (decimal): Minimum salary
- `maxSalary` (decimal): Maximum salary
- `salaryCurrency` (string): Currency code (default: USD)
- `code` (string): Short position code (e.g., "SWE-SR")
- `requirements` (text): Job requirements (can store JSON)
- `responsibilities` (text): Job responsibilities (can store JSON)
- `headcount` (integer): Number of employees in this position
- `isActive` (boolean): Active status
- `createdBy`, `updatedBy`: Audit fields
- `createdAt`, `updatedAt`: Timestamps

**Position Levels:**

- INTERN
- JUNIOR
- INTERMEDIATE
- SENIOR
- LEAD
- PRINCIPAL
- MANAGER
- SENIOR_MANAGER
- DIRECTOR
- SENIOR_DIRECTOR
- VP (Vice President)
- SVP (Senior Vice President)
- C_LEVEL (C-Suite Executive)

### EmployeeDepartment Entity (Junction Table)

**Fields:**

- `id` (UUID): Primary key
- `employeeId` (UUID): Reference to employee
- `departmentId` (UUID): Reference to department
- `isManager` (boolean): Is employee a manager in this department
- `isPrimary` (boolean): Is this the employee's primary department
- `startDate` (date): When employee joined department
- `endDate` (date): When employee left department (nullable)
- `role` (string): Specific role in the department
- `isActive` (boolean): Active status

## API Endpoints

### Department Endpoints

#### GET /api/departments

Get all departments with optional filters.

**Query Parameters:**

- `isActive` (boolean): Filter by active status
- `type` (DepartmentType): Filter by department type
- `search` (string): Search by name, code, or description
- `parentId` (string | "null"): Filter by parent department

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Engineering",
      "code": "ENG",
      "type": "ENGINEERING",
      "location": "San Francisco",
      "isActive": true,
      "parentDepartment": null,
      "subDepartments": [...],
      "employees": [...]
    }
  ],
  "count": 1
}
```

#### GET /api/departments/hierarchy

Get department hierarchy as a tree structure.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Engineering",
      "subDepartments": [
        {
          "id": "uuid",
          "name": "Backend",
          "subDepartments": [...]
        }
      ]
    }
  ]
}
```

#### GET /api/departments/:id

Get a specific department by ID.

#### GET /api/departments/:id/employees

Get all employees in a department.

**Query Parameters:**

- `includeInactive` (boolean): Include inactive employees

#### GET /api/departments/:id/stats

Get department statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "department": {...},
    "totalEmployees": 25,
    "managers": 3,
    "subDepartmentsCount": 4
  }
}
```

#### POST /api/departments

Create a new department.

**Request Body:**

```json
{
  "name": "Frontend Engineering",
  "description": "Frontend development team",
  "parentId": "parent-uuid",
  "type": "ENGINEERING",
  "code": "FE",
  "location": "Remote",
  "managerId": "employee-uuid",
  "budget": "{\"annual\": 500000}"
}
```

#### PUT /api/departments/:id

Update a department.

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": false
}
```

#### DELETE /api/departments/:id

Soft delete a department (sets `isActive` to false).

**Note:** Cannot delete if:

- Department has active sub-departments
- Department has active employees

#### DELETE /api/departments/:id/hard

Permanently delete a department.

**Note:** Cannot delete if:

- Department has any sub-departments
- Department has any employee associations

#### POST /api/departments/move-employees

Move employees from one department to another.

**Request Body:**

```json
{
  "fromDepartmentId": "uuid",
  "toDepartmentId": "uuid",
  "employeeIds": ["uuid1", "uuid2"] // Optional, moves all if not provided
}
```

### Position Endpoints

#### GET /api/positions

Get all positions with optional filters.

**Query Parameters:**

- `isActive` (boolean): Filter by active status
- `level` (PositionLevel): Filter by position level
- `search` (string): Search by name, code, or description
- `parentId` (string | "null"): Filter by parent position
- `minSalary` (number): Filter by minimum salary
- `maxSalary` (number): Filter by maximum salary

#### GET /api/positions/hierarchy

Get position hierarchy as a tree structure.

#### GET /api/positions/by-level/:level

Get all positions of a specific level.

**Example:** `/api/positions/by-level/SENIOR`

#### GET /api/positions/by-salary

Get positions within a salary range.

**Query Parameters:**

- `minSalary` (number): Required
- `maxSalary` (number): Required

**Example:** `/api/positions/by-salary?minSalary=100000&maxSalary=150000`

#### GET /api/positions/:id

Get a specific position by ID.

#### GET /api/positions/:id/employees

Get all employees in a position.

**Query Parameters:**

- `activeOnly` (boolean): Only return active employees (default: true)

#### GET /api/positions/:id/stats

Get position statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "position": {...},
    "totalEmployees": 15,
    "activeEmployees": 12,
    "subPositionsCount": 2
  }
}
```

#### POST /api/positions

Create a new position.

**Request Body:**

```json
{
  "name": "Senior Software Engineer",
  "description": "Senior development position",
  "level": "SENIOR",
  "parentId": "parent-position-uuid",
  "minSalary": 120000,
  "maxSalary": 170000,
  "salaryCurrency": "USD",
  "code": "SWE-SR",
  "requirements": "{\"experience\": \"5+ years\"}",
  "responsibilities": "{\"lead\": true}"
}
```

#### PUT /api/positions/:id

Update a position.

#### DELETE /api/positions/:id

Soft delete a position (sets `isActive` to false).

**Note:** Cannot delete if:

- Position has active sub-positions
- Position has active employees

#### DELETE /api/positions/:id/hard

Permanently delete a position.

#### POST /api/positions/update-headcounts

Update headcount for all positions based on current active employees.

## Permissions

Two new permissions are required:

### DEPARTMENT_MANAGEMENT

- `canView`: View departments
- `canCreate`: Create departments
- `canUpdate`: Update departments
- `canDelete`: Delete departments

### POSITION_MANAGEMENT

- `canView`: View positions
- `canCreate`: Create positions
- `canUpdate`: Update positions
- `canDelete`: Delete positions

**By default:**

- **Admin role**: Full access (all permissions)
- **Employee role**: View-only access

## Sample Data

The `seed-departments-positions.sql` script creates:

- **11 departments** including Engineering, Product, Design, HR, Marketing, Sales, QA, Data Science, Security, Customer Support, and Business
- **31 positions** covering all levels from Intern to Director
- Realistic salary ranges ($40K - $300K)

## Frontend Integration

### Example: Fetch All Departments

```typescript
import axios from "../services/axios";

const getDepartments = async () => {
  const response = await axios.get("/api/departments");
  return response.data;
};
```

### Example: Create Department

```typescript
const createDepartment = async (data: DepartmentCreate) => {
  const response = await axios.post("/api/departments", data);
  return response.data;
};
```

### Example: Get Department Hierarchy

```typescript
const getDepartmentTree = async () => {
  const response = await axios.get("/api/departments/hierarchy");
  return response.data;
};
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Testing

### Using Postman or curl

```bash
# Login first to get cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt

# Get all departments
curl http://localhost:5000/api/departments \
  -b cookies.txt

# Create a department
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "New Department",
    "type": "ENGINEERING",
    "code": "NEW"
  }'
```

## Notes

- All routes require authentication
- Permissions are checked based on user role
- Departments and positions support hierarchical structures
- Both entities have soft delete (isActive flag) and hard delete options
- Employee-department relationships are tracked through EmployeeDepartment junction table
- Position headcounts are automatically updated when employees are assigned
