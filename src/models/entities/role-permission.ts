import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Role } from "./role";
import { Permission } from "./permission";

@Entity("role_permissions")
@Index(["roleId", "permissionId"], { unique: true })
export class RolePermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  roleId!: number;

  @Column({ type: "int" })
  permissionId!: number;

  // View and Read permissions
  @Column({ type: "boolean", default: false })
  canView!: boolean;

  @Column({ type: "boolean", default: false })
  canRead!: boolean;

  // CRUD permissions
  @Column({ type: "boolean", default: false })
  canCreate!: boolean;

  @Column({ type: "boolean", default: false })
  canUpdate!: boolean;

  @Column({ type: "boolean", default: false })
  canDelete!: boolean;

  @Column({ type: "boolean", default: false })
  canPermanentlyDelete!: boolean;

  // Special permissions
  @Column({ type: "boolean", default: false })
  canSetPermission!: boolean;

  @Column({ type: "boolean", default: false })
  canImport!: boolean;

  @Column({ type: "boolean", default: false })
  canExport!: boolean;

  // Workflow permissions
  @Column({ type: "boolean", default: false })
  canSubmit!: boolean;

  @Column({ type: "boolean", default: false })
  canCancel!: boolean;

  @Column({ type: "boolean", default: false })
  canApprove!: boolean;

  @Column({ type: "boolean", default: false })
  canReject!: boolean;

  @Column({ type: "boolean", default: false })
  canAssign!: boolean;

  // HR specific permissions
  @Column({ type: "boolean", default: false })
  canViewSalary!: boolean;

  @Column({ type: "boolean", default: false })
  canEditSalary!: boolean;

  @Column({ type: "boolean", default: false })
  canViewBenefit!: boolean;

  // Reporting permissions
  @Column({ type: "boolean", default: false })
  canReport!: boolean;

  // Visibility permissions
  @Column({ type: "boolean", default: false })
  canViewPartial!: boolean;

  @Column({ type: "boolean", default: false })
  canViewBelongTo!: boolean;

  @Column({ type: "boolean", default: false })
  canViewOwner!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "roleId" })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    eager: true,
  })
  @JoinColumn({ name: "permissionId" })
  permission!: Permission;
}
