import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { EmployeeDepartment } from "./employee-department";

@Entity("departments")
export class Department {
  @Index()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  @Index()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  parentId?: string;

  // Self-referencing relationship for parent department
  @ManyToOne(() => Department, (department) => department.subDepartments, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "parentId" })
  parentDepartment?: Department;

  // Self-referencing relationship for sub-departments
  @OneToMany(() => Department, (department) => department.parentDepartment)
  subDepartments?: Department[];

  @OneToMany(
    () => EmployeeDepartment,
    (employeeDepartment) => employeeDepartment.department
  )
  employees!: EmployeeDepartment[];

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  code?: string; // Department code (e.g., ENG, HR, FIN)

  @Column({ type: "varchar", length: 100, nullable: true })
  location?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  @Index()
  managerId?: string; // Reference to employee who manages this department

  @Column({ type: "text", nullable: true })
  budget?: string; // Can store JSON with budget details

  // Audit fields
  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to get full department path
  getFullPath(): string {
    // This would need to be implemented with recursive logic
    return this.name;
  }
}
