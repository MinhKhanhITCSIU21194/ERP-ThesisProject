import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";

@Entity("users")
@Unique(["username"])
@Unique(["email"])
@Unique(["employeeCode"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column({ type: "varchar", length: 50 })
  @Index()
  username!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  email!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  firstName!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  lastName!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "boolean", default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: "varchar", length: 20, nullable: true })
  @Index()
  employeeCode?: string;

  @Column({ type: "int" }) // Keep roleId as number - lookup table
  @Index()
  roleId!: number;

  @Column({ type: "timestamp", nullable: true })
  lastLogin?: Date;

  @Column({ type: "int", default: 0 })
  failedLoginAttempts!: number;

  @Column({ type: "boolean", default: false })
  @Index()
  isEmailVerified!: boolean;

  @Column({ type: "timestamp", nullable: true })
  accountLockedUntil?: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  passwordChangedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  setupToken?: string;

  @Column({ type: "timestamp", nullable: true })
  setupTokenExpiry?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships will be defined using string references to avoid circular imports
  @ManyToOne("Role", "users", { eager: true })
  @JoinColumn({ name: "roleId" })
  role!: any;

  @OneToMany("Session", "user")
  sessions!: any[];

  @OneToMany("Notification", "recipient")
  receivedNotifications!: any[];

  @OneToMany("Notification", "sentBy")
  sentNotifications!: any[];

  // Methods
  isAccountLocked(): boolean {
    return this.accountLockedUntil
      ? new Date() < this.accountLockedUntil
      : false;
  }

  shouldForcePasswordChange(): boolean {
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - 3);
    return this.passwordChangedAt < monthsAgo;
  }
}
