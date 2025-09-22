import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  roleId!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @Index()
  roleName!: string;

  @Column({ type: "jsonb", default: {} })
  permissions!: Record<string, any>;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  @Index()
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships - using string reference to avoid circular imports
  @OneToMany("User", "role")
  users!: any[];

  // Methods
  hasPermission(resource: string, action: string): boolean {
    if (this.permissions.all === true) {
      return true;
    }

    return (
      this.permissions[resource] && this.permissions[resource][action] === true
    );
  }

  canManage(resource: string): boolean {
    return (
      this.hasPermission(resource, "create") &&
      this.hasPermission(resource, "read") &&
      this.hasPermission(resource, "update") &&
      this.hasPermission(resource, "delete")
    );
  }
}
