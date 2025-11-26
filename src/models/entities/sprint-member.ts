import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { Sprint } from "./sprint";
import { Employee } from "./employee";

export enum SprintMemberRole {
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER",
  REVIEWER = "REVIEWER",
  SCRUM_MASTER = "SCRUM_MASTER",
  PRODUCT_OWNER = "PRODUCT_OWNER",
  OBSERVER = "OBSERVER",
}

@Entity("sprint_members")
@Unique(["sprintId", "employeeId"]) // Prevent duplicate memberships
export class SprintMember {
  @PrimaryGeneratedColumn("uuid")
  sprintMemberId!: string;

  @Column({ type: "uuid" })
  @Index()
  sprintId!: string;

  @ManyToOne(() => Sprint, (sprint) => sprint.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sprintId" })
  sprint!: Sprint;

  @Column({ type: "uuid" })
  @Index()
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column({
    type: "enum",
    enum: SprintMemberRole,
    default: SprintMemberRole.DEVELOPER,
  })
  role!: SprintMemberRole;

  @CreateDateColumn()
  joinedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  leftAt?: Date;

  // Check if member is still active
  isActive(): boolean {
    return !this.leftAt || new Date() < this.leftAt;
  }

  // Mark member as left
  leave(): void {
    this.leftAt = new Date();
  }
}
