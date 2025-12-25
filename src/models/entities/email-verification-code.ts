import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  Check,
} from "typeorm";
import { User } from "./user";

export enum VerificationType {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
  TWO_FACTOR = "two_factor",
}

@Entity("email_verifications")
@Check(
  `"verificationType" IN ('email_verification', 'password_reset', 'two_factor')`
)
@Check(`"code" ~ '^[0-9]{6}$'`) // Ensures 6-digit numeric code
export class EmailVerification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid" })
  @Index()
  userId!: string;

  @Column({ type: "varchar", length: 6 })
  code!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  email!: string;

  @Column({
    type: "enum",
    enum: VerificationType,
    default: VerificationType.EMAIL_VERIFICATION,
  })
  @Index()
  verificationType!: VerificationType;

  @Column({ type: "timestamp" })
  @Index()
  expiresAt!: Date;

  @Column({ type: "boolean", default: false })
  @Index()
  isUsed!: boolean;

  @Column({ type: "int", default: 0 })
  attemptCount!: number;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "text", nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  usedAt?: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  // Helper methods
  isValid(): boolean {
    return !this.isUsed && this.expiresAt > new Date();
  }

  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  canAttempt(): boolean {
    return this.attemptCount < 5;
  }

  incrementAttempt(): void {
    this.attemptCount += 1;
  }

  markAsUsed(): void {
    this.isUsed = true;
    this.usedAt = new Date();
  }

  getExpiryMinutes(): number {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    return Math.max(
      0,
      Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60))
    );
  }

  getDisplayType(): string {
    switch (this.verificationType) {
      case VerificationType.EMAIL_VERIFICATION:
        return "Email Verification";
      case VerificationType.PASSWORD_RESET:
        return "Password Reset";
      case VerificationType.TWO_FACTOR:
        return "Two-Factor Authentication";
      default:
        return "Verification";
    }
  }
}
