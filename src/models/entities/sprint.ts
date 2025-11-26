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
import { Project } from "./project";
import { Task } from "./task";
import { SprintMember } from "./sprint-member";

export enum SprintStatus {
  PLANNED = "PLANNED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity("sprints")
export class Sprint {
  @PrimaryGeneratedColumn("uuid")
  sprintId!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  goal?: string;

  @Column({ type: "uuid" })
  @Index()
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.sprints, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "projectId" })
  project!: Project;

  @Column({
    type: "enum",
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  @Index()
  status!: SprintStatus;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  endDate!: Date;

  @OneToMany(() => Task, (task) => task.sprint)
  tasks!: Task[];

  @OneToMany(() => SprintMember, (member) => member.sprint)
  members!: SprintMember[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Methods
  start(): void {
    this.status = SprintStatus.ACTIVE;
  }

  complete(): void {
    this.status = SprintStatus.COMPLETED;
  }

  cancel(): void {
    this.status = SprintStatus.CANCELLED;
  }

  isActive(): boolean {
    return this.status === SprintStatus.ACTIVE;
  }
}
