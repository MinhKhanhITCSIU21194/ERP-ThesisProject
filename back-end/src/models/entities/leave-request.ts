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
import { Employee } from "./employee";
import { User } from "./user";

export enum LeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum LeaveType {
  SICK = "SICK",
  PERSONAL = "PERSONAL",
  VACATION = "VACATION",
  OTHER = "OTHER",
}

@Entity("leave_requests")
export class LeaveRequest {
  @PrimaryGeneratedColumn("uuid")
  leaveRequestId!: string;

  @Column({ type: "uuid" })
  @Index()
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column({ type: "date" })
  @Index()
  startDate!: Date;

  @Column({ type: "date" })
  @Index()
  endDate!: Date;

  @Column({ type: "decimal", precision: 3, scale: 1 })
  leavePeriodStartDate!: number; // 1 for all day, 0.5 for half day

  @Column({ type: "decimal", precision: 3, scale: 1 })
  leavePeriodEndDate!: number; // 1 for all day, 0.5 for half day

  @Column({ type: "decimal", precision: 4, scale: 1 })
  totalDays!: number;

  @Column({
    type: "enum",
    enum: LeaveType,
  })
  leaveType!: LeaveType;

  @Column({ type: "text", nullable: true })
  reason?: string;

  @Column({
    type: "enum",
    enum: LeaveRequestStatus,
    default: LeaveRequestStatus.PENDING,
  })
  @Index()
  status!: LeaveRequestStatus;

  @Column({ type: "uuid" })
  @Index()
  approverId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "approverId" })
  approver!: User;

  @Column({ type: "text", nullable: true })
  approverComment?: string;

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Methods
  approve(approverId: string, comment?: string): void {
    this.status = LeaveRequestStatus.APPROVED;
    this.approverComment = comment;
    this.approvedAt = new Date();
  }

  reject(approverId: string, comment?: string): void {
    this.status = LeaveRequestStatus.REJECTED;
    this.approverComment = comment;
    this.approvedAt = new Date();
  }

  cancel(): void {
    this.status = LeaveRequestStatus.CANCELLED;
  }

  canBeModified(): boolean {
    return this.status === LeaveRequestStatus.PENDING;
  }
}
