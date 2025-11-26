import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Task } from "./task";
import { Employee } from "./employee";

export enum AttachmentType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}

@Entity("task_attachments")
export class TaskAttachment {
  @PrimaryGeneratedColumn("uuid")
  attachmentId!: string;

  @Column("uuid")
  taskId!: string;

  @Column("uuid")
  uploadedById!: string;

  @Column()
  fileName!: string;

  @Column()
  filePath!: string;

  @Column()
  fileSize!: number;

  @Column()
  mimeType!: string;

  @Column({
    type: "enum",
    enum: AttachmentType,
    default: AttachmentType.OTHER,
  })
  type!: AttachmentType;

  @CreateDateColumn()
  uploadedAt!: Date;

  // Relations
  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task!: Task;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "uploadedById" })
  uploadedBy!: Employee;
}
