import { z } from "zod";
import { randomUUID } from "crypto";

/**
 * Generate a stable ID for bullets and items.
 */
export function generateStableId(): string {
  return randomUUID();
}

export const ContactInfoSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  github: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  portfolio: z.string().optional().default(""),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

export const ExperienceBulletSchema = z.object({
  id: z.string().optional().default(() => generateStableId()),
  text: z.string().default(""),
});

export type ExperienceBullet = z.infer<typeof ExperienceBulletSchema>;

export const ExperienceItemSchema = z.object({
  id: z.string().optional().default(() => generateStableId()),
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().optional().default(""),
  startDate: z.string().default(""),
  endDate: z.string().optional().default("Present"),
  current: z.boolean().optional().default(false),
  bullets: z.array(ExperienceBulletSchema).default([]),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const ProjectItemSchema = z.object({
  id: z.string().optional().default(() => generateStableId()),
  name: z.string().default(""),
  description: z.string().default(""),
  role: z.string().optional().default(""),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional().default(""),
  bullets: z.array(ExperienceBulletSchema).default([]),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const EducationItemSchema = z.object({
  id: z.string().optional().default(() => generateStableId()),
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
});

export type EducationItem = z.infer<typeof EducationItemSchema>;

export const PreferencesSchema = z.object({
  roleTypes: z.array(z.string()).default([]),
  location: z.string().default(""),
  remotePreference: z
    .enum(["remote", "hybrid", "onsite", "flexible"])
    .optional()
    .default("flexible"),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const ProfileSchema = z.object({
  contact: ContactInfoSchema,
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  preferences: PreferencesSchema.default({
    roleTypes: [],
    location: "",
    remotePreference: "flexible",
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Strict schema for saving a profile to the database.
 * Requires at least full name and a valid email address.
 */
export const SaveProfileSchema = ProfileSchema.extend({
  contact: ContactInfoSchema.extend({
    name: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("A valid email address is required"),
  }),
});

/**
 * Ensures all experience items, bullets, projects, and education entries have stable IDs.
 * Existing IDs are preserved; missing or empty IDs are assigned once.
 */
export function ensureStableIds(raw: unknown): Profile {
  const parsed = ProfileSchema.parse(raw);

  return {
    ...parsed,
    experience: parsed.experience.map((exp) => ({
      ...exp,
      id: exp.id && exp.id.trim().length > 0 ? exp.id : generateStableId(),
      bullets: exp.bullets.map((b) => ({
        ...b,
        id: b.id && b.id.trim().length > 0 ? b.id : generateStableId(),
      })),
    })),
    projects: parsed.projects.map((proj) => ({
      ...proj,
      id: proj.id && proj.id.trim().length > 0 ? proj.id : generateStableId(),
      bullets: proj.bullets.map((b) => ({
        ...b,
        id: b.id && b.id.trim().length > 0 ? b.id : generateStableId(),
      })),
    })),
    education: parsed.education.map((edu) => ({
      ...edu,
      id: edu.id && edu.id.trim().length > 0 ? edu.id : generateStableId(),
    })),
  };
}
