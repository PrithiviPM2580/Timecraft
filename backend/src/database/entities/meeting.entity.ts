import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity.js";
import { Event } from "./event.entity.js";

export enum MeetingStatusEnum {
  SCHEDULED = "SCHEDULED",
  CANCELED = "CANCELED",
}

@Entity({ name: "meetings" })
export class Meeting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.meetings)
  user: User;

  @ManyToOne(() => Event, (event) => event.meetings)
  event: Event;

  @Column({ type: "text" })
  guestName: string;

  @Column({ type: "text" })
  guestEmail: string;

  @Column({ type: "text", nullable: false })
  additionalInfo: string;

  @Column({ type: "timestamptz" })
  startTime: Date;

  @Column({ type: "timestamptz" })
  endTime: Date;

  @Column({ type: "text" })
  meetLink: string;

  @Column({ type: "text" })
  calendarEventId: string;

  @Column({ type: "enum", enum: MeetingStatusEnum })
  status: MeetingStatusEnum;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
