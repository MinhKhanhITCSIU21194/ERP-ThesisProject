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
  DeleteDateColumn,
} from "typeorm";
import { User } from "./user";
import { Position } from "./position";
import { EmployeeDepartment } from "./employee-department";

export enum EmploymentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
  TERMINATED = "TERMINATED",
  RESIGNED = "RESIGNED",
  RETIRED = "RETIRED",
}

export enum ContractType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  TEMPORARY = "TEMPORARY",
  FREELANCE = "FREELANCE",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
  SEPARATED = "SEPARATED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  employeeId!: string;

  // Link to User account (optional - an employee might not have a user account yet)
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({ type: "uuid", nullable: true })
  @Index()
  userId?: string;

  // Basic Information
  @Column({ type: "varchar", length: 50, unique: true })
  @Index()
  employeeCode!: string; // e.g., EMP001, EMP002

  @Column({ type: "varchar", length: 100 })
  firstName!: string;

  @Column({ type: "varchar", length: 100 })
  lastName!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  middleName?: string;

  @Column({ type: "date" })
  dateOfBirth!: Date;

  @Column({
    type: "enum",
    enum: Gender,
    default: Gender.PREFER_NOT_TO_SAY,
  })
  gender!: Gender;

  @Column({
    type: "enum",
    enum: MaritalStatus,
    default: MaritalStatus.SINGLE,
  })
  maritalStatus!: MaritalStatus;

  @Column({ type: "varchar", length: 50, nullable: true })
  nationality?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  @Index()
  nationalId?: string; // National ID / Social Security Number

  @Column({ type: "varchar", length: 20, nullable: true })
  passportNumber?: string;

  // Contact Information
  @Column({ type: "varchar", length: 100, unique: true })
  @Index()
  email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  emergencyContactNumber?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  emergencyContactName?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  emergencyContactRelationship?: string;

  // Address Information
  @Column({ type: "text", nullable: true })
  currentAddress?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  city?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  state?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  country?: string;

  @Column({ type: "text", nullable: true })
  permanentAddress?: string;

  // Employment Information
  @Column({ type: "date" })
  @Index()
  hireDate!: Date;

  @Column({ type: "date", nullable: true })
  confirmationDate?: Date; // Date when probation period ended

  @Column({ type: "date", nullable: true })
  @Index()
  terminationDate?: Date;

  @Column({
    type: "enum",
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  @Index()
  employmentStatus!: EmploymentStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  department?: string; // Legacy field - kept for backwards compatibility

  // Many-to-Many relationship with Departments through EmployeeDepartment
  @OneToMany(
    () => EmployeeDepartment,
    (employeeDepartment) => employeeDepartment.employee
  )
  departments?: EmployeeDepartment[];

  @Column({ type: "uuid", nullable: true })
  @Index()
  positionId?: string;

  // Link to Position entity
  @ManyToOne(() => Position, (position) => position.employees, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "positionId" })
  positionEntity?: Position;

  @Column({ type: "varchar", length: 100, nullable: true })
  position?: string; // Legacy field - kept for backwards compatibility

  @Column({ type: "varchar", length: 100, nullable: true })
  jobTitle?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  workLocation?: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  reportingManagerId?: string; // Self-referencing to another employee

  // Contract Information
  @Column({
    type: "enum",
    enum: ContractType,
    default: ContractType.FULL_TIME,
  })
  contractType!: ContractType;

  @Column({ type: "date", nullable: true })
  contractStartDate?: Date;

  @Column({ type: "date", nullable: true })
  contractEndDate?: Date;

  @Column({ type: "text", nullable: true })
  contractDetails?: string;

  @Column({ type: "int", default: 40 })
  weeklyWorkHours!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  salary?: number;

  @Column({ type: "varchar", length: 10, default: "USD" })
  salaryCurrency!: string;

  @Column({ type: "varchar", length: 20, default: "MONTHLY" })
  salaryFrequency!: string; // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY

  // Bank Information
  @Column({ type: "varchar", length: 100, nullable: true })
  bankName?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  bankAccountHolderName?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  bankBranchCode?: string;

  // Additional Information
  @Column({ type: "varchar", length: 10, nullable: true })
  bloodGroup?: string;

  @Column({ type: "text", nullable: true })
  medicalConditions?: string;

  @Column({ type: "text", nullable: true })
  allergies?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  profilePicture?: string; // URL to profile picture

  @Column({ type: "text", nullable: true })
  skills?: string; // JSON array of skills

  @Column({ type: "text", nullable: true })
  qualifications?: string; // JSON array of qualifications

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

  // Computed property for full name
  get fullName(): string {
    return this.middleName
      ? `${this.firstName} ${this.middleName} ${this.lastName}`
      : `${this.firstName} ${this.lastName}`;
  }

  // Computed property for age
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  // Computed property for years of service
  get yearsOfService(): number {
    const today = new Date();
    const hire = new Date(this.hireDate);
    let years = today.getFullYear() - hire.getFullYear();
    const monthDiff = today.getMonth() - hire.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < hire.getDate())
    ) {
      years--;
    }
    return years;
  }

  // Check if employee is active
  isActive(): boolean {
    return this.employmentStatus === EmploymentStatus.ACTIVE;
  }

  // Check if contract is expiring soon (within 30 days)
  isContractExpiringSoon(): boolean {
    if (!this.contractEndDate) return false;
    const today = new Date();
    const endDate = new Date(this.contractEndDate);
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }
}
