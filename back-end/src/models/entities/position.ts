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
import { Employee } from "./employee";

export enum PositionLevel {
  INTERN = "INTERN",
  JUNIOR = "JUNIOR",
  INTERMEDIATE = "INTERMEDIATE",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
  PRINCIPAL = "PRINCIPAL",
  MANAGER = "MANAGER",
  SENIOR_MANAGER = "SENIOR_MANAGER",
  DIRECTOR = "DIRECTOR",
  SENIOR_DIRECTOR = "SENIOR_DIRECTOR",
  VP = "VP",
  SVP = "SVP",
  C_LEVEL = "C_LEVEL",
}

@Entity("positions")
export class Position {
  @Index()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  @Index()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: PositionLevel,
    nullable: true,
  })
  level?: PositionLevel;

  @OneToMany(() => Employee, (employee) => employee.positionEntity)
  employees?: Employee[];

  @Column({ type: "uuid", nullable: true })
  @Index()
  parentId?: string;

  // Self-referencing relationship for parent position
  @ManyToOne(() => Position, (position) => position.subPositions, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "parentId" })
  parentPosition?: Position;

  // Self-referencing relationship for sub-positions
  @OneToMany(() => Position, (position) => position.parentPosition)
  subPositions?: Position[];

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  minSalary?: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  maxSalary?: number;

  @Column({ type: "varchar", length: 10, default: "USD" })
  salaryCurrency!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  code?: string; // Position code (e.g., SWE-SR, PM-L)

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "text", nullable: true })
  requirements?: string; // Can store JSON with job requirements

  @Column({ type: "text", nullable: true })
  responsibilities?: string; // Can store JSON with job responsibilities

  @Column({ type: "int", default: 0 })
  headcount!: number; // Number of employees in this position

  // Audit fields
  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to get salary range as string
  getSalaryRange(): string {
    if (this.minSalary && this.maxSalary) {
      return `${
        this.salaryCurrency
      } ${this.minSalary.toLocaleString()} - ${this.maxSalary.toLocaleString()}`;
    }
    return "Not specified";
  }
}
