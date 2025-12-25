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
import { Department } from "./department";

@Entity("employees_departments")
export class EmployeeDepartment {
  @Index()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  employeeId!: string;

  @Column({ type: "uuid" })
  @Index()
  departmentId!: string;

  @ManyToOne(() => Employee, (employee) => employee.departments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "employeeId", referencedColumnName: "employeeId" })
  employee!: Employee;

  @ManyToOne(() => Department, (department) => department.employees, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "departmentId", referencedColumnName: "id" })
  department!: Department;

  @Column({ type: "boolean", default: false })
  isManager!: boolean;

  @Column({ type: "boolean", default: true })
  isPrimary!: boolean; // Indicates if this is the employee's primary department

  @Column({ type: "date", nullable: true })
  startDate?: Date; // When the employee joined this department

  @Column({ type: "date", nullable: true })
  endDate?: Date; // When the employee left this department (if applicable)

  @Column({ type: "varchar", length: 100, nullable: true })
  role?: string; // Specific role within the department

  @Column({ type: "text", nullable: true })
  responsibilities?: string; // Can store JSON with specific responsibilities

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  // Audit fields
  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check if assignment is currently active
  isCurrentlyActive(): boolean {
    const now = new Date();
    const isWithinDateRange =
      (!this.startDate || new Date(this.startDate) <= now) &&
      (!this.endDate || new Date(this.endDate) >= now);
    return this.isActive && isWithinDateRange;
  }
}
