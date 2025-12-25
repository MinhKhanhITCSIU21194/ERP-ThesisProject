import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Task } from "./task";
import { Employee } from "./employee";

@Entity("task_comments")
export class TaskComment {
  @PrimaryGeneratedColumn("uuid")
  commentId!: string;

  @Column("uuid")
  taskId!: string;

  @Column("uuid")
  authorId!: string;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task!: Task;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "authorId" })
  author!: Employee;
}
