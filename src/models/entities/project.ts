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
} from "typeorm";
import { Employee } from "./employee";
import { Sprint } from "./sprint";
import { ProjectMember } from "./project-member";

export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ProjectPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  projectId!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  @Index()
  status!: ProjectStatus;

  @Column({
    type: "enum",
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority!: ProjectPriority;

  @Column({ type: "date", nullable: true })
  startDate?: Date;

  @Column({ type: "date", nullable: true })
  endDate?: Date;

  @Column({ type: "uuid" })
  @Index()
  projectManagerId!: string;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "projectManagerId" })
  projectManager!: Employee;

  @Column({ type: "timestamp", nullable: true })
  lastAccessedAt?: Date;

  @Column({ type: "boolean", default: false })
  @Index()
  isRecent!: boolean;

  @OneToMany(() => Sprint, (sprint) => sprint.project)
  sprints!: Sprint[];

  @OneToMany(() => ProjectMember, (member) => member.project)
  members!: ProjectMember[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Methods
  markAsRecent(): void {
    this.isRecent = true;
    this.lastAccessedAt = new Date();
  }

  markAsActive(): void {
    this.status = ProjectStatus.ACTIVE;
  }

  complete(): void {
    this.status = ProjectStatus.COMPLETED;
  }

  cancel(): void {
    this.status = ProjectStatus.CANCELLED;
  }
}
