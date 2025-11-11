import { AppDataSource } from "../config/typeorm";
import { Permission } from "../models/entities/permission";
import { Role } from "../models/entities/role";

/**
 * Permission definitions based on UserPermission enum
 */
const permissionDefinitions = [
  { permission: "USER_MANAGEMENT", name: "User Management" },
  { permission: "ROLE_MANAGEMENT", name: "Role Management" },
  { permission: "EMPLOYEE_MANAGEMENT", name: "Employee Management" },
  { permission: "DEPARTMENT_MANAGEMENT", name: "Department Management" },
  { permission: "POSITION_MANAGEMENT", name: "Position Management" },
  { permission: "PAYROLL_MANAGEMENT", name: "Payroll Management" },
  { permission: "ATTENDANCE_MANAGEMENT", name: "Attendance Management" },
  { permission: "LEAVE_MANAGEMENT", name: "Leave Management" },
  { permission: "RECRUITMENT_MANAGEMENT", name: "Recruitment Management" },
  { permission: "PROJECT_MANAGEMENT", name: "Project Management" },
  { permission: "TASK_MANAGEMENT", name: "Task Management" },
  { permission: "SPRINT_MANAGEMENT", name: "Sprint Management" },
  { permission: "DOCUMENT_MANAGEMENT", name: "Document Management" },
  { permission: "REPORT_MANAGEMENT", name: "Report Management" },
  { permission: "NOTIFICATION_MANAGEMENT", name: "Notification Management" },
  { permission: "SETTINGS_MANAGEMENT", name: "Settings Management" },
  { permission: "AUDIT_LOG", name: "Audit Log" },
  { permission: "DASHBOARD", name: "Dashboard" },
  { permission: "CALENDAR", name: "Calendar" },
  { permission: "CHAT", name: "Chat" },
  { permission: "FILE_STORAGE", name: "File Storage" },
  { permission: "WORKFLOW_MANAGEMENT", name: "Workflow Management" },
  { permission: "APPROVAL_MANAGEMENT", name: "Approval Management" },
];

/**
 * Admin permissions - full access to everything
 */
const adminPermissionSettings = {
  canView: true,
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canSetPermission: true,
  canImport: true,
  canExport: true,
  canSubmit: true,
  canCancel: true,
  canApprove: true,
  canViewSalary: true,
  canEditSalary: true,
  canReject: true,
  canReport: true,
  canAssign: true,
  canViewPartial: true,
  canViewBenefit: true,
  canViewBelongTo: true,
  canViewOwner: true,
  canPermanentlyDelete: true,
  createdBy: "system",
};

/**
 * Manager permissions - limited access
 */
const managerPermissionSettings = {
  canView: true,
  canCreate: false,
  canRead: true,
  canUpdate: true,
  canDelete: false,
  canSetPermission: false,
  canImport: false,
  canExport: true,
  canSubmit: true,
  canCancel: true,
  canApprove: true,
  canViewSalary: false,
  canEditSalary: false,
  canReject: true,
  canReport: true,
  canAssign: true,
  canViewPartial: true,
  canViewBenefit: false,
  canViewBelongTo: true,
  canViewOwner: false,
  canPermanentlyDelete: false,
  createdBy: "system",
};

/**
 * Employee permissions - read-only access
 */
const employeePermissionSettings = {
  canView: true,
  canCreate: false,
  canRead: true,
  canUpdate: false,
  canDelete: false,
  canSetPermission: false,
  canImport: false,
  canExport: false,
  canSubmit: true,
  canCancel: false,
  canApprove: false,
  canViewSalary: false,
  canEditSalary: false,
  canReject: false,
  canReport: false,
  canAssign: false,
  canViewPartial: true,
  canViewBenefit: true,
  canViewBelongTo: true,
  canViewOwner: true,
  canPermanentlyDelete: false,
  createdBy: "system",
};

async function seedPermissions() {
  try {
    console.log("🌱 Starting permission seeding...\n");

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection initialized\n");
    }

    const permissionRepo = AppDataSource.getRepository(Permission);
    const roleRepo = AppDataSource.getRepository(Role);

    // Step 1: Drop old JSONB permissions column if it exists
    console.log("🗑️  Checking for old JSONB permissions column...");
    try {
      await AppDataSource.query(
        `ALTER TABLE roles DROP COLUMN IF EXISTS permissions;`
      );
      console.log("✅ Old permissions column dropped (if existed)\n");
    } catch (error) {
      console.log("⚠️  Column might not exist or already dropped\n");
    }

    // Step 2: Clear existing permissions (if any)
    console.log("🧹 Clearing existing permissions and role associations...");
    const existingCount = await permissionRepo.count();
    if (existingCount > 0) {
      // First clear the junction table role_permissions
      await AppDataSource.query(`TRUNCATE TABLE role_permissions CASCADE;`);
      // Then clear permissions
      await AppDataSource.query(
        `TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;`
      );
      console.log(`✅ Cleared ${existingCount} existing permissions\n`);
    } else {
      console.log("✅ No existing permissions to clear\n");
    }

    // Step 3: Create ALL permission records (23 total)
    // Each permission has a unique name and specific settings for admin role
    console.log("� Creating permission records...");
    const allPermissions: Permission[] = [];
    for (const def of permissionDefinitions) {
      const permission = permissionRepo.create({
        ...def,
        ...adminPermissionSettings, // Start with admin settings (we'll use different ones per role)
      });
      const saved = await permissionRepo.save(permission);
      allPermissions.push(saved);
      console.log(`  ✓ ${def.name}`);
    }
    console.log(`✅ Created ${allPermissions.length} permission records\n`);

    // Step 4: Define which permissions go to which role
    const adminPermissions = allPermissions; // Admin gets ALL permissions

    const managerResources = [
      "EMPLOYEE_MANAGEMENT",
      "ATTENDANCE_MANAGEMENT",
      "LEAVE_MANAGEMENT",
      "PROJECT_MANAGEMENT",
      "TASK_MANAGEMENT",
      "SPRINT_MANAGEMENT",
      "DOCUMENT_MANAGEMENT",
      "REPORT_MANAGEMENT",
      "DASHBOARD",
      "CALENDAR",
    ];
    const managerPermissions = allPermissions.filter((p) =>
      managerResources.includes(p.permission)
    );

    const employeeResources = [
      "ATTENDANCE_MANAGEMENT",
      "LEAVE_MANAGEMENT",
      "TASK_MANAGEMENT",
      "DOCUMENT_MANAGEMENT",
      "DASHBOARD",
      "CALENDAR",
      "CHAT",
    ];
    const employeePermissions = allPermissions.filter((p) =>
      employeeResources.includes(p.permission)
    );

    // Step 5: Assign permissions to roles
    console.log("🔗 Assigning permissions to roles...\n");

    // Admin role
    const adminRole = await roleRepo.findOne({
      where: { name: "Admin" },
      relations: ["permissions"],
    });
    if (adminRole) {
      adminRole.permissions = adminPermissions;
      await roleRepo.save(adminRole);
      console.log(
        `✅ Assigned ${adminPermissions.length} permissions to Admin role`
      );
    } else {
      console.log("⚠️  Admin role not found - creating it...");
      const newAdminRole = roleRepo.create({
        name: "Admin",
        description: "Administrator with full system access",
        isActive: true,
        createdBy: "system",
        permissions: adminPermissions,
      });
      await roleRepo.save(newAdminRole);
      console.log("✅ Created Admin role with full permissions");
    }

    // Manager role
    const managerRole = await roleRepo.findOne({
      where: { name: "Manager" },
      relations: ["permissions"],
    });
    if (managerRole) {
      managerRole.permissions = managerPermissions;
      await roleRepo.save(managerRole);
      console.log(
        `✅ Assigned ${managerPermissions.length} permissions to Manager role`
      );
    } else {
      console.log("⚠️  Manager role not found - creating it...");
      const newManagerRole = roleRepo.create({
        name: "Manager",
        description: "Manager with limited system access",
        isActive: true,
        createdBy: "system",
        permissions: managerPermissions,
      });
      await roleRepo.save(newManagerRole);
      console.log("✅ Created Manager role with limited permissions");
    }

    // Employee role
    const employeeRole = await roleRepo.findOne({
      where: { name: "Employee" },
      relations: ["permissions"],
    });
    if (employeeRole) {
      employeeRole.permissions = employeePermissions;
      await roleRepo.save(employeeRole);
      console.log(
        `✅ Assigned ${employeePermissions.length} permissions to Employee role`
      );
    } else {
      console.log("⚠️  Employee role not found - creating it...");
      const newEmployeeRole = roleRepo.create({
        name: "Employee",
        description: "Regular employee with read-only access",
        isActive: true,
        createdBy: "system",
        permissions: employeePermissions,
      });
      await roleRepo.save(newEmployeeRole);
      console.log("✅ Created Employee role with read-only permissions");
    }

    console.log("\n🎉 Permission seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(
      `  - Admin: ${adminPermissions.length} permissions (full access)`
    );
    console.log(
      `  - Manager: ${managerPermissions.length} permissions (limited access)`
    );
    console.log(
      `  - Employee: ${employeePermissions.length} permissions (read-only)`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    process.exit(1);
  }
}

// Run the seed
seedPermissions();
