import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from "typeorm";
import { Permission } from "./permission";

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

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true, // Automatically load permissions with role
    cascade: true,
  })
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "roleId", referencedColumnName: "roleId" },
    inverseJoinColumn: { name: "permissionId", referencedColumnName: "id" },
  })
  permissions!: Permission[];

  // Methods
  hasPermission(resource: string, action: string): boolean {
    const permission = this.permissions?.find((p) => p.permission === resource);
    if (!permission) return false;

    // Map action to permission field
    const actionMap: Record<string, keyof Permission> = {
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
    return field ? permission[field] === true : false;
  }

  canManage(resource: string): boolean {
    return (
      this.hasPermission(resource, "create") &&
      this.hasPermission(resource, "read") &&
      this.hasPermission(resource, "update") &&
      this.hasPermission(resource, "delete")
    );
  }

  getPermissionByResource(resource: string): Permission | undefined {
    return this.permissions?.find((p) => p.permission === resource);
  }
}
