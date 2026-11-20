import mongoose, { Schema, Document, Model } from "mongoose";
import { Profile } from "@/lib/profile/schema";

export interface ProfileDoc extends Document, Profile {
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const BulletSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const ExperienceItemMongooseSchema = new Schema(
  {
    id: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: "" },
    startDate: { type: String, required: true },
    endDate: { type: String, default: "Present" },
    current: { type: Boolean, default: false },
    bullets: { type: [BulletSchema], default: [] },
  },
  { _id: false }
);

const ProjectItemMongooseSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    role: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    link: { type: String, default: "" },
    bullets: { type: [BulletSchema], default: [] },
  },
  { _id: false }
);

const EducationItemMongooseSchema = new Schema(
  {
    id: { type: String, required: true },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  { _id: false }
);

const ProfileMongooseSchema = new Schema<ProfileDoc>(
  {
    ownerId: { type: String, required: true, unique: true, default: "default" },
    contact: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: [ExperienceItemMongooseSchema], default: [] },
    projects: { type: [ProjectItemMongooseSchema], default: [] },
    education: { type: [EducationItemMongooseSchema], default: [] },
    preferences: {
      roleTypes: { type: [String], default: [] },
      location: { type: String, default: "" },
      remotePreference: {
        type: String,
        enum: ["remote", "hybrid", "onsite", "flexible"],
        default: "flexible",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ProfileModel: Model<ProfileDoc> =
  mongoose.models.Profile ||
  mongoose.model<ProfileDoc>("Profile", ProfileMongooseSchema);
