import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity.js";
import { DayAvailability } from "./day-availability.entity.js";

@Entity()
export class Availability {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user.availability)
  user: User;

  @OneToMany(
    () => DayAvailability,
    (dayAvailability) => dayAvailability.availability,
  )
  days: DayAvailability[];

  @Column({ type: "int", default: 30 })
  timeGap: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
