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
import { Sprint } from "./sprint";
import { Employee } from "./employee";
import { TaskComment } from "./task-comment";
import { TaskAttachment } from "./task-attachment";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  BLOCKED = "BLOCKED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum TaskType {
  STORY = "STORY",
  BUG = "BUG",
  TASK = "TASK",
  EPIC = "EPIC",
}

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  taskId!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "uuid" })
  @Index()
  sprintId!: string;

  @ManyToOne(() => Sprint, (sprint) => sprint.tasks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sprintId" })
  sprint!: Sprint;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @Index()
  status!: TaskStatus;

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: "enum",
    enum: TaskType,
    default: TaskType.TASK,
  })
  taskType!: TaskType;

  @Column({ type: "uuid", nullable: true })
  @Index()
  assignedTo?: string;

  @ManyToOne(() => Employee, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "assignedTo" })
  assignee?: Employee;

  @Column({ type: "int", nullable: true })
  storyPoints?: number;

  @Column({ type: "int", nullable: true })
  estimatedHours?: number;

  @Column({ type: "int", nullable: true })
  actualHours?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments!: TaskComment[];

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments!: TaskAttachment[];

  // Methods
  moveToInProgress(): void {
    this.status = TaskStatus.IN_PROGRESS;
  }

  moveToReview(): void {
    this.status = TaskStatus.IN_REVIEW;
  }

  complete(): void {
    this.status = TaskStatus.DONE;
  }

  block(): void {
    this.status = TaskStatus.BLOCKED;
  }

  assign(employeeId: string): void {
    this.assignedTo = employeeId;
  }
}
