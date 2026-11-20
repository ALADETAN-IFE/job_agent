import mongoose, { Schema, Document, Model } from "mongoose";
import { JobAnalysis, TailoredCv, CoverLetter, JobInput } from "@/lib/ai";

export interface ApplicationDoc extends Document {
  ownerId: string;
  job: JobInput;
  toneSample?: string;
  analysis?: JobAnalysis;
  tailoredCv?: TailoredCv;
  coverLetter?: CoverLetter;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationMongooseSchema = new Schema<ApplicationDoc>(
  {
    ownerId: { type: String, required: true, default: "default", index: true },
    job: {
      title: { type: String, required: true },
      company: { type: String, required: true },
      description: { type: String, required: true },
    },
    toneSample: { type: String, default: "" },
    analysis: {
      requiredSkills: { type: [String], default: [] },
      niceToHaveSkills: { type: [String], default: [] },
      keywords: { type: [String], default: [] },
      matchScore: { type: Number, default: 0 },
      matched: { type: [String], default: [] },
      gaps: { type: [String], default: [] },
    },
    tailoredCv: {
      summary: { type: String, default: "" },
      skills: { type: [String], default: [] },
      experience: { type: [Schema.Types.Mixed], default: [] },
      projects: { type: [Schema.Types.Mixed], default: [] },
    },
    coverLetter: {
      body: { type: String, default: "" },
    },
    approved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ApplicationModel: Model<ApplicationDoc> =
  mongoose.models.Application ||
  mongoose.model<ApplicationDoc>("Application", ApplicationMongooseSchema);
