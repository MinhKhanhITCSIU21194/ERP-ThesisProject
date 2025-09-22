import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from "typeorm";

export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
}

@Entity("notifications")
@Check(`"type" IN ('info', 'warning', 'error', 'success')`)
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  @Index()
  type!: NotificationType;

  @Column({ type: "boolean", default: false })
  @Index()
  isRead!: boolean;

  @Column({ type: "uuid" })
  @Index()
  recipientUserId!: string;

  @Column({ type: "uuid", nullable: true })
  @Index()
  sentByUserId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  readAt?: Date;

  // Relationships - using string references to avoid circular imports
  @ManyToOne("User", "receivedNotifications", { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipientUserId" })
  recipient!: any;

  @ManyToOne("User", "sentNotifications", { onDelete: "SET NULL" })
  @JoinColumn({ name: "sentByUserId" })
  sentBy?: any;

  // Methods
  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }

  isUrgent(): boolean {
    return (
      this.type === NotificationType.ERROR ||
      this.type === NotificationType.WARNING
    );
  }

  getDisplayClass(): string {
    switch (this.type) {
      case NotificationType.SUCCESS:
        return "alert-success";
      case NotificationType.WARNING:
        return "alert-warning";
      case NotificationType.ERROR:
        return "alert-danger";
      default:
        return "alert-info";
    }
  }
}
