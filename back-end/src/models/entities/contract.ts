import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from "typeorm";
import { Employee } from "./employee";

export enum ContractStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
}

export enum ContractType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  TEMPORARY = "TEMPORARY",
  FREELANCE = "FREELANCE",
}

export enum WorkingType {
  ONSITE = "ONSITE",
  REMOTE = "REMOTE",
  HYBRID = "HYBRID",
}

@Entity("contracts")
export class Contract {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  @Index()
  contractNumber!: string;

  @Column({ type: "uuid" })
  @Index()
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column({
    type: "enum",
    enum: ContractType,
  })
  contractType!: ContractType;

  @Column({
    type: "enum",
    enum: WorkingType,
  })
  workingType!: WorkingType;

  @Column({
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status!: ContractStatus;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date", nullable: true })
  endDate?: Date;

  @Column({ type: "text", nullable: true })
  contractFile?: string; // URL or path to contract document

  @Column({ type: "text", nullable: true })
  terms?: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  salary?: number;

  @Column({ type: "varchar", length: 10, default: "USD" })
  salaryCurrency!: string;

  @Column({ type: "varchar", length: 20, default: "MONTHLY" })
  salaryFrequency!: string; // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY

  @Column({ type: "int", default: 40 })
  weeklyWorkHours!: number;

  @Column({ type: "text", nullable: true })
  notes?: string;

  // Audit fields
  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Check if contract is expiring soon (within specified days)
  isExpiringSoon(days: number = 30): boolean {
    if (!this.endDate || this.status !== ContractStatus.ACTIVE) return false;

    const endDate = new Date(this.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry > 0 && daysUntilExpiry <= days;
  }

  // Check if contract is expired
  isExpired(): boolean {
    if (!this.endDate) return false;

    const endDate = new Date(this.endDate);
    const today = new Date();

    return today > endDate;
  }
}
