import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity.js";

export enum IntegerationproviderEnum {
  GOOGLE = "GOOGLE",
  ZOOM = "ZOOM",
}

export enum IntegerationAppTypeEnum {
  GOOGLE_MEET_AND_CALENDAR = "GOOGLE_MEET_AND_CALENDAR",
  ZOOM_MEETING = "ZOOM_MEETING",
  OUTLOOK_CALENDAR = "OUTLOOK_CALENDAR",
}

export enum IntegerationCategoryEnum {
  CALENDAR_AND_VIDEO_CONFERENCING = "CALENDAR_AND_VIDEO_CONFERENCING",
  VIDEO_CONFERENCING = "VIDEO_CONFERENCING",
  CALENDAR = "CALENDAR",
}

interface GoogleMeetAndCalendarMetadata {
  scope: string;
  token_type: string;
}

interface ZoomMeetMetadata {}

type IntegrationMetadata = GoogleMeetAndCalendarMetadata | ZoomMeetMetadata;

@Entity({ name: "integrations" })
export class Integration {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: IntegerationproviderEnum })
  provider: IntegerationproviderEnum;

  @Column({ type: "enum", enum: IntegerationAppTypeEnum })
  app_type: IntegerationAppTypeEnum;

  @Column({ type: "enum", enum: IntegerationCategoryEnum })
  category: IntegerationCategoryEnum;

  @Column({ type: "text" })
  access_token: string;

  @Column({ type: "text", nullable: true })
  refresh_token: string;

  @Column({ type: "bigint", nullable: true })
  expiry_date: number | null;

  @Column({ type: "json" })
  metadata: IntegrationMetadata;

  @Column({ type: "boolean", default: true })
  isConnected: boolean;

  @Column({ type: "uuid", nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.integrations)
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
