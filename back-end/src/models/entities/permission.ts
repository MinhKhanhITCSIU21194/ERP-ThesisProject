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

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  @Index()
  permission!: string; // e.g., "USER_MANAGEMENT", "EMPLOYEE_MANAGEMENT"

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string; // Human-readable name

  // View and Read permissions
  @Column({ type: "boolean", default: false })
  canView?: boolean;

  @Column({ type: "boolean", default: false })
  canRead?: boolean;

  // CRUD permissions
  @Column({ type: "boolean", default: false })
  canCreate?: boolean;

  @Column({ type: "boolean", default: false })
  canUpdate?: boolean;

  @Column({ type: "boolean", default: false })
  canDelete?: boolean;

  @Column({ type: "boolean", default: false })
  canPermanentlyDelete?: boolean;

  // Special permissions
  @Column({ type: "boolean", default: false })
  canSetPermission?: boolean;

  @Column({ type: "boolean", default: false })
  canImport?: boolean;

  @Column({ type: "boolean", default: false })
  canExport?: boolean;

  // Workflow permissions
  @Column({ type: "boolean", default: false })
  canSubmit?: boolean;

  @Column({ type: "boolean", default: false })
  canCancel?: boolean;

  @Column({ type: "boolean", default: false })
  canApprove?: boolean;

  @Column({ type: "boolean", default: false })
  canReject?: boolean;

  @Column({ type: "boolean", default: false })
  canAssign?: boolean;

  // HR specific permissions
  @Column({ type: "boolean", default: false })
  canViewSalary?: boolean;

  @Column({ type: "boolean", default: false })
  canEditSalary?: boolean;

  @Column({ type: "boolean", default: false })
  canViewBenefit?: boolean;

  // Reporting permissions
  @Column({ type: "boolean", default: false })
  canReport?: boolean;

  // Visibility permissions
  @Column({ type: "boolean", default: false })
  canViewPartial?: boolean;

  @Column({ type: "boolean", default: false })
  canViewBelongTo?: boolean;

  @Column({ type: "boolean", default: false })
  canViewOwner?: boolean;

  // Audit fields
  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  deletedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt?: Date;

  // Soft delete flag
  @Column({ type: "boolean", default: false })
  @Index()
  isDeleted!: boolean;

  // Relationships
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission
  )
  rolePermissions!: RolePermission[];

  // Helper methods
  hasAnyPermission(): boolean {
    return (
      this.canView === true ||
      this.canRead === true ||
      this.canCreate === true ||
      this.canUpdate === true ||
      this.canDelete === true
    );
  }

  hasFullAccess(): boolean {
    return (
      this.canView === true &&
      this.canCreate === true &&
      this.canRead === true &&
      this.canUpdate === true &&
      this.canDelete === true
    );
  }
}
