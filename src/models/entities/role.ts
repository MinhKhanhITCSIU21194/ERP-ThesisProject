import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { RolePermission } from "./role-permission";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  roleId!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @Index()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @OneToMany("User", "role")
  users!: any[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    eager: true,
    cascade: true,
  })
  rolePermissions!: RolePermission[];

  // Methods
  hasPermission(resource: string, action: string): boolean {
    const rolePermission = this.rolePermissions?.find(
      (rp) => rp.permission?.permission === resource
    );
    if (!rolePermission) return false;

    // Map action to permission field
    const actionMap: Record<string, keyof RolePermission> = {
      view: "canView",
      read: "canRead",
      create: "canCreate",
      update: "canUpdate",
      delete: "canDelete",
      approve: "canApprove",
      reject: "canReject",
      assign: "canAssign",
      submit: "canSubmit",
      cancel: "canCancel",
      import: "canImport",
      export: "canExport",
      report: "canReport",
    };

    const field = actionMap[action];
    return field ? rolePermission[field] === true : false;
  }

  canManage(resource: string): boolean {
    return (
      this.hasPermission(resource, "create") &&
      this.hasPermission(resource, "read") &&
      this.hasPermission(resource, "update") &&
      this.hasPermission(resource, "delete")
    );
  }

  getPermissionByResource(resource: string): RolePermission | undefined {
    return this.rolePermissions?.find(
      (rp) => rp.permission?.permission === resource
    );
  }
}
