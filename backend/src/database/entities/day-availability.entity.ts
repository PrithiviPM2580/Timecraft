import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Availability } from "./availability.entity.js";

export enum DayOfWeekEnum {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

@Entity()
export class DayAvailability {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Availability, (availability) => availability.days)
  availability: Availability;

  @Column({ type: "enum", enum: DayOfWeekEnum })
  day: DayOfWeekEnum;

  @Column({ type: "timestamptz" })
  startTime: Date;

  @Column({ type: "timestamptz" })
  endTime: Date;

  @Column({ type: "boolean", default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
