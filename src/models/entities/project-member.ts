import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { Project } from "./project";
import { Employee } from "./employee";

export enum ProjectMemberRole {
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TECH_LEAD = "TECH_LEAD",
  DEVELOPER = "DEVELOPER",
  DESIGNER = "DESIGNER",
  QA = "QA",
  BUSINESS_ANALYST = "BUSINESS_ANALYST",
  PRODUCT_OWNER = "PRODUCT_OWNER",
  SCRUM_MASTER = "SCRUM_MASTER",
}

@Entity("project_members")
@Unique(["projectId", "employeeId"]) // Prevent duplicate memberships
export class ProjectMember {
  @PrimaryGeneratedColumn("uuid")
  memberId!: string;

  @Column({ type: "uuid" })
  @Index()
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "projectId" })
  project!: Project;

  @Column({ type: "uuid" })
  @Index()
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column({
    type: "enum",
    enum: ProjectMemberRole,
    default: ProjectMemberRole.DEVELOPER,
  })
  role!: ProjectMemberRole;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  joinedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  leftAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Methods
  leave(): void {
    this.leftAt = new Date();
  }

  isActive(): boolean {
    return this.leftAt === null || this.leftAt === undefined;
  }

  rejoin(): void {
    this.leftAt = undefined;
    this.joinedAt = new Date();
  }
}
