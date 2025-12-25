-- ============================================
-- ERP System - PostgreSQL Schema Diagram
-- Database: ERP Thesis Project
-- Date: December 4, 2025
-- ============================================

-- This script creates a complete schema with all tables, relationships, and constraints
-- Use tools like pgAdmin, DBeaver, or draw.io to visualize this schema

-- ============================================
-- 1. AUTHENTICATION & USER MANAGEMENT MODULE
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    employee_code VARCHAR(20) UNIQUE,
    role_id INTEGER NOT NULL,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    is_email_verified BOOLEAN DEFAULT false,
    account_locked_until TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_first_name ON users(first_name);
CREATE INDEX idx_users_last_name ON users(last_name);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_employee_code ON users(employee_code);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_email_verified ON users(is_email_verified);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    permission VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    can_view BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_permanently_delete BOOLEAN DEFAULT false,
    can_set_permission BOOLEAN DEFAULT false,
    can_import BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT false,
    can_submit BOOLEAN DEFAULT false,
    can_cancel BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    can_reject BOOLEAN DEFAULT false,
    can_assign BOOLEAN DEFAULT false,
    can_view_salary BOOLEAN DEFAULT false,
    can_edit_salary BOOLEAN DEFAULT false,
    can_view_benefit BOOLEAN DEFAULT false,
    can_report BOOLEAN DEFAULT false,
    can_view_partial BOOLEAN DEFAULT false,
    can_view_belong_to BOOLEAN DEFAULT false,
    can_view_owner BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_permissions_permission ON permissions(permission);
CREATE INDEX idx_permissions_is_deleted ON permissions(is_deleted);

-- Role-Permission Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Email Verification Codes Table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR')),
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    attempt_count INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_user_id ON email_verification_codes(user_id);
CREATE INDEX idx_email_verification_email ON email_verification_codes(email);
CREATE INDEX idx_email_verification_type ON email_verification_codes(verification_type);
CREATE INDEX idx_email_verification_expires_at ON email_verification_codes(expires_at);
CREATE INDEX idx_email_verification_is_used ON email_verification_codes(is_used);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS')),
    is_read BOOLEAN DEFAULT false,
    recipient_user_id UUID NOT NULL,
    sent_by_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_recipient_user_id ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_sent_by_user_id ON notifications(sent_by_user_id);

-- ============================================
-- 2. HR MODULE - EMPLOYEE MANAGEMENT
-- ============================================

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE,
    level VARCHAR(50) CHECK (level IN ('INTERN', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'LEAD', 'PRINCIPAL', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'SENIOR_DIRECTOR', 'VP', 'SVP', 'C_LEVEL')),
    parent_id UUID,
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    requirements TEXT, -- JSON
    responsibilities TEXT, -- JSON
    headcount INTEGER DEFAULT 0,
    current_headcount INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES positions(id) ON DELETE SET NULL
);

CREATE INDEX idx_positions_code ON positions(code);
CREATE INDEX idx_positions_level ON positions(level);
CREATE INDEX idx_positions_parent_id ON positions(parent_id);
CREATE INDEX idx_positions_is_active ON positions(is_active);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE,
    parent_id UUID,
    manager_id UUID,
    location VARCHAR(255),
    budget TEXT, -- JSON
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);
CREATE INDEX idx_departments_is_active ON departments(is_active);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    employee_code VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50) DEFAULT 'PREFER_NOT_TO_SAY' CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    marital_status VARCHAR(50) DEFAULT 'SINGLE' CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED')),
    nationality VARCHAR(50),
    national_id VARCHAR(20),
    passport_number VARCHAR(20),
    email VARCHAR(100),
    phone_number VARCHAR(20),
    emergency_contact_number VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    current_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    permanent_address TEXT,
    hire_date DATE NOT NULL,
    confirmation_date DATE,
    termination_date DATE,
    employment_status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED', 'RETIRED')),
    position_id UUID,
    job_title VARCHAR(100),
    work_location VARCHAR(100),
    reporting_manager_id UUID,
    suggested_role VARCHAR(100),
    setup_token VARCHAR(500),
    setup_token_expiry TIMESTAMP,
    has_completed_setup BOOLEAN DEFAULT false,
    weekly_work_hours NUMERIC DEFAULT 40,
    salary DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    salary_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_holder_name VARCHAR(50),
    bank_branch_code VARCHAR(50),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    allergies TEXT,
    profile_picture VARCHAR(255),
    skills TEXT, -- JSON
    qualifications TEXT, -- JSON
    notes TEXT,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    FOREIGN KEY (reporting_manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_code ON employees(employee_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_email ON employees(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_national_id ON employees(national_id);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_termination_date ON employees(termination_date);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);
CREATE INDEX idx_employees_position_id ON employees(position_id);
CREATE INDEX idx_employees_reporting_manager_id ON employees(reporting_manager_id);

-- Add foreign key from departments to employees (manager)
ALTER TABLE departments ADD FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- Employee-Department Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS employee_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    department_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_manager BOOLEAN DEFAULT false,
    role VARCHAR(100),
    responsibilities TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_departments_employee_id ON employee_departments(employee_id);
CREATE INDEX idx_employee_departments_department_id ON employee_departments(department_id);
CREATE INDEX idx_employee_departments_is_primary ON employee_departments(is_primary);
CREATE UNIQUE INDEX idx_employee_departments_unique ON employee_departments(employee_id, department_id) WHERE deleted_at IS NULL;

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    contract_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'PROBATION', 'INTERNSHIP', 'TEMPORARY')),
    working_type VARCHAR(50) NOT NULL CHECK (working_type IN ('ONSITE', 'REMOTE', 'HYBRID')),
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED')),
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(12,2) NOT NULL,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    work_hours_per_week NUMERIC DEFAULT 40,
    terms_and_conditions TEXT,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX idx_contracts_employee_id ON contracts(employee_id);
CREATE INDEX idx_contracts_contract_type ON contracts(contract_type);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_start_date ON contracts(start_date);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('SICK', 'PERSONAL', 'VACATION', 'OTHER')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approver_id UUID,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_leave_type ON leave_requests(leave_type);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX idx_leave_requests_approver_id ON leave_requests(approver_id);

-- ============================================
-- 3. PROJECT MANAGEMENT MODULE
-- ============================================

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    start_date DATE,
    end_date DATE,
    project_manager_id UUID NOT NULL,
    last_accessed_at TIMESTAMP,
    is_recent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_manager_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_manager_id ON projects(project_manager_id);
CREATE INDEX idx_projects_is_recent ON projects(is_recent);

-- Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'DEVELOPER' CHECK (role IN ('PROJECT_MANAGER', 'TECH_LEAD', 'DEVELOPER', 'DESIGNER', 'QA', 'BUSINESS_ANALYST', 'PRODUCT_OWNER', 'SCRUM_MASTER')),
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_employee_id ON project_members(employee_id);
CREATE INDEX idx_project_members_joined_at ON project_members(joined_at);
CREATE INDEX idx_project_members_left_at ON project_members(left_at);
CREATE UNIQUE INDEX idx_project_members_unique ON project_members(project_id, employee_id) WHERE left_at IS NULL;

-- Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
    sprint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    goal TEXT,
    project_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);

-- Sprint Members Table
CREATE TABLE IF NOT EXISTS sprint_members (
    sprint_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'DEVELOPER' CHECK (role IN ('DEVELOPER', 'TESTER', 'REVIEWER', 'SCRUM_MASTER', 'PRODUCT_OWNER', 'OBSERVER')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(sprint_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX idx_sprint_members_sprint_id ON sprint_members(sprint_id);
CREATE INDEX idx_sprint_members_employee_id ON sprint_members(employee_id);
CREATE UNIQUE INDEX idx_sprint_members_unique ON sprint_members(sprint_id, employee_id) WHERE left_at IS NULL;

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sprint_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED')),
    priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    task_type VARCHAR(50) DEFAULT 'TASK' CHECK (task_type IN ('STORY', 'BUG', 'TASK', 'EPIC')),
    assigned_to UUID,
    story_points INTEGER,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(sprint_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_author_id ON task_comments(author_id);

-- Task Attachments Table
CREATE TABLE IF NOT EXISTS task_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    uploaded_by_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'OTHER' CHECK (type IN ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_uploaded_by_id ON task_attachments(uploaded_by_id);

-- ============================================
-- RELATIONSHIP SUMMARY
-- ============================================

-- Authentication Module:
-- users -> roles (Many-to-One)
-- roles <-> permissions (Many-to-Many via role_permissions)
-- users -> sessions (One-to-Many)
-- users -> email_verification_codes (One-to-Many)
-- users -> notifications (One-to-Many as recipient)
-- users -> notifications (One-to-Many as sender)

-- HR Module:
-- employees -> users (One-to-One)
-- employees -> positions (Many-to-One)
-- employees -> departments (Many-to-Many via employee_departments)
-- employees -> employees (Self-referencing for reporting_manager)
-- employees -> contracts (One-to-Many)
-- employees -> leave_requests (One-to-Many)
-- departments -> employees (Many-to-One as manager)
-- departments -> departments (Self-referencing for parent)
-- positions -> positions (Self-referencing for parent)

-- Project Management Module:
-- projects -> employees (Many-to-One as project_manager)
-- projects -> project_members (One-to-Many)
-- projects -> sprints (One-to-Many)
-- project_members -> employees (Many-to-One)
-- sprints -> sprint_members (One-to-Many)
-- sprints -> tasks (One-to-Many)
-- sprint_members -> employees (Many-to-One)
-- tasks -> employees (Many-to-One as assignee)
-- tasks -> task_comments (One-to-Many)
-- tasks -> task_attachments (One-to-Many)
-- task_comments -> employees (Many-to-One as author)
-- task_attachments -> employees (Many-to-One as uploader)

-- ============================================
-- VISUALIZATION INSTRUCTIONS
-- ============================================

/*
To visualize this schema:

1. Using pgAdmin:
   - Connect to your database
   - Right-click on the database -> ERD For Database
   - It will generate an Entity-Relationship Diagram automatically

2. Using DBeaver:
   - Connect to your database
   - Right-click on the database -> View Diagram
   - Or Database -> ER Diagram
   - Supports export as PNG, PDF, SVG

3. Using dbdiagram.io:
   - Go to https://dbdiagram.io/
   - Paste this SQL or convert to DBML format
   - Visual drag-and-drop interface

4. Using draw.io (diagrams.net):
   - Import SQL structure
   - Or manually create based on relationships above

5. Using SchemaSpy:
   - Install SchemaSpy
   - Run: java -jar schemaspy.jar -t pgsql -db your_db -u user -p password
   - Generates HTML documentation with interactive diagrams

6. Using PostgreSQL Extensions:
   - Install postgresql_autodoc
   - Run: postgresql_autodoc -d your_database -t dot
   - Use Graphviz to render: dot -Tpng database.dot -o schema.png

Key Relationships to Highlight:
- User <-> Employee (1:1) - Core identity link
- Employee -> Position/Department - Organizational structure
- Project -> Sprint -> Task - Agile workflow hierarchy
- Role -> Permission - Security model
- Employee -> Leave Requests/Contracts - HR lifecycle
*/
