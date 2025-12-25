import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Role } from "../models/entities/role";
import { Permission } from "../models/entities/permission";
import { RolePermission } from "../models/entities/role-permission";

config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "erp_system",
  entities: [__dirname + "/../models/entities/*.{ts,js}"],
  synchronize: false,
  logging: true,
});

async function setAdminPermissions() {
  try {
    console.log("Connecting to database...");
    await AppDataSource.initialize();
    console.log("Connected to database successfully");

    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);

    // Find Admin role
    console.log("\nFinding Admin role...");
    const adminRole = await roleRepository.findOne({
      where: { name: "Admin" },
    });

    if (!adminRole) {
      console.error("Admin role not found! Please create Admin role first.");
      process.exit(1);
    }
    console.log(`Found Admin role with ID: ${adminRole.roleId}`);

    // Find all permissions
    console.log("\nFetching all permissions...");
    const allPermissions = await permissionRepository.find();
    console.log(`Found ${allPermissions.length} permissions`);

    // Delete existing admin permissions
    console.log("\nDeleting existing Admin role permissions...");
    await rolePermissionRepository.delete({ roleId: adminRole.roleId });
    console.log("Existing permissions deleted");

    // Create new permissions with all flags set to true
    console.log("\nCreating new permissions with all flags enabled...");
    const rolePermissions = allPermissions.map((permission) => {
      const rp = new RolePermission();
      rp.roleId = adminRole.roleId;
      rp.permissionId = permission.id;

      // Set all permission flags to true
      rp.canView = true;
      rp.canRead = true;
      rp.canCreate = true;
      rp.canUpdate = true;
      rp.canDelete = true;
      rp.canPermanentlyDelete = true;
      rp.canSetPermission = true;
      rp.canImport = true;
      rp.canExport = true;
      rp.canSubmit = true;
      rp.canCancel = true;
      rp.canApprove = true;
      rp.canReject = true;
      rp.canAssign = true;
      rp.canViewSalary = true;
      rp.canEditSalary = true;
      rp.canViewBenefit = true;
      rp.canReport = true;
      rp.canViewPartial = true;
      rp.canViewBelongTo = true;
      rp.canViewOwner = true;

      return rp;
    });

    await rolePermissionRepository.save(rolePermissions);
    console.log(
      `Successfully created ${rolePermissions.length} permissions for Admin role`
    );

    // Verify the permissions
    console.log("\nVerifying permissions...");
    const verifyPermissions = await rolePermissionRepository.find({
      where: { roleId: adminRole.roleId },
      relations: ["permission"],
    });

    console.log("\nAdmin role permissions:");
    verifyPermissions.forEach((rp) => {
      console.log(
        `  - ${rp.permission.name} (${rp.permission.permission}): All flags enabled`
      );
    });

    console.log(
      "\n✅ Successfully set all permission flags to true for Admin role"
    );
  } catch (error) {
    console.error("Error setting admin permissions:", error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\nDatabase connection closed");
    }
  }
}

setAdminPermissions();
