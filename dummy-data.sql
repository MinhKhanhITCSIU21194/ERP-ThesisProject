-- Create dummy data for testing authentication

-- First, insert roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('super_admin', 'Super Administrator with full access', '{"users": {"create": true, "read": true, "update": true, "delete": true}, "roles": {"create": true, "read": true, "update": true, "delete": true}, "system": {"settings": true, "backup": true, "logs": true}}'),
  ('admin', 'Administrator with management access', '{"users": {"create": true, "read": true, "update": true, "delete": false}, "reports": {"create": true, "read": true}, "system": {"settings": false}}'),
  ('hr_manager', 'HR Manager with employee management', '{"employees": {"create": true, "read": true, "update": true, "delete": false}, "users": {"create": true, "read": true, "update": false}, "reports": {"hr": true}}'),
  ('project_manager', 'Project Manager with project oversight', '{"projects": {"create": true, "read": true, "update": true, "delete": false}, "tasks": {"create": true, "read": true, "update": true}, "users": {"read": true}}'),
  ('user', 'Basic user with limited access', '{"profile": {"read": true, "update": true}, "projects": {"read": true}, "tasks": {"read": true, "update": true}}');

-- Reset role sequence to continue from 6
ALTER SEQUENCE "roles_roleId_seq" RESTART WITH 6;

-- Now, insert users with proper bcrypt hashed passwords
INSERT INTO users (username, email, "firstName", "lastName", "passwordHash", "isActive", "employeeId", "roleId", "createdAt", "updatedAt", "passwordChangedAt")
VALUES
  ('admin', 'admin@company.com', 'Admin', 'User', '$2b$12$0ileGPQrJ82z6Ab5w/4Sfuz6FZtKkkxOxqirH6Wmcr5T2ppT0tyx.', true, 'EMP001', 1, NOW(), NOW(), NOW()),
  ('john.doe', 'john.doe@company.com', 'John', 'Doe', '$2b$12$DkagzvRgRxT0.fg4vla7j.W/6XHUXLmsFhw8TnwyAf9KwSScJW8WG', true, 'EMP002', 2, NOW(), NOW(), NOW()),
  ('jane.smith', 'jane.smith@company.com', 'Jane', 'Smith', '$2b$12$.iDnpi75q9KVZf7hDf7B2.MOhJGN.F2L1ok4CndpVcEJ50QqoNCIu', true, 'EMP003', 3, NOW(), NOW(), NOW()),
  ('bob.wilson', 'bob.wilson@company.com', 'Bob', 'Wilson', '$2b$12$DkagzvRgRxT0.fg4vla7j.W/6XHUXLmsFhw8TnwyAf9KwSScJW8WG', true, 'EMP004', 4, NOW(), NOW(), NOW()),
  ('alice.brown', 'alice.brown@company.com', 'Alice', 'Brown', '$2b$12$.iDnpi75q9KVZf7hDf7B2.MOhJGN.F2L1ok4CndpVcEJ50QqoNCIu', true, 'EMP005', 5, NOW(), NOW(), NOW()),
  ('charlie.davis', 'charlie.davis@company.com', 'Charlie', 'Davis', '$2b$12$DkagzvRgRxT0.fg4vla7j.W/6XHUXLmsFhw8TnwyAf9KwSScJW8WG', true, 'EMP006', 5, NOW(), NOW(), NOW()),
  ('diana.miller', 'diana.miller@company.com', 'Diana', 'Miller', '$2b$12$.iDnpi75q9KVZf7hDf7B2.MOhJGN.F2L1ok4CndpVcEJ50QqoNCIu', true, 'EMP007', 5, NOW(), NOW(), NOW()),
  ('test.user', 'test@company.com', 'Test', 'User', '$2b$12$DkagzvRgRxT0.fg4vla7j.W/6XHUXLmsFhw8TnwyAf9KwSScJW8WG', true, 'EMP008', 5, NOW(), NOW(), NOW());

-- Reset user sequence (UUIDs don't need sequence reset, but we'll keep this for consistency if needed)
-- Note: UUID primary keys don't use sequences, so this is just for reference

-- Display created data
SELECT 'Roles created:' as info;
SELECT "roleId", name, description FROM roles;

SELECT 'Users created:' as info;
SELECT "userId", username, email, "firstName", "lastName", "roleId" FROM users;

-- Test credentials:
-- admin@company.com / AdminPass123!
-- john.doe@company.com / Password123!
-- jane.smith@company.com / UserPass123!
-- test@company.com / Password123!