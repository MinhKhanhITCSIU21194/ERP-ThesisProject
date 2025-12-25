import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  sessionId!: string;

  @Column({ type: "uuid" })
  @Index()
  userId!: string;

  @Column({ type: "varchar", length: 500, unique: true })
  @Index()
  sessionToken!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refreshToken?: string;

  @Column({ type: "inet", nullable: true })
  ipAddress?: string;

  @Column({ type: "text", nullable: true })
  userAgent?: string;

  @Column({ type: "boolean", default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: "timestamp" })
  @Index()
  expiresAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastActivity!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  // Relationships - using string reference to avoid circular imports
  @ManyToOne("User", "sessions", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: any;

  // Methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }

  updateActivity(): void {
    this.lastActivity = new Date();
  }
}
