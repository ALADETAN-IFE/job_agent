import { describe, it, expect } from "vitest";
import { ProfileSchema, SaveProfileSchema, ensureStableIds } from "./schema";

describe("ProfileSchema and ensureStableIds", () => {
  it("validates a minimal profile and provides defaults", () => {
    const raw = {
      contact: {
        name: "Dev Lagos",
        email: "dev@example.com",
        phone: "+2348012345678",
        location: "Lagos, Nigeria",
      },
      summary: "Full-stack developer with 5 years experience.",
      skills: ["TypeScript", "Next.js", "Node.js", "MongoDB"],
    };

    const parsed = ProfileSchema.parse(raw);
    expect(parsed.contact.name).toBe("Dev Lagos");
    expect(parsed.experience).toEqual([]);
    expect(parsed.projects).toEqual([]);
    expect(parsed.education).toEqual([]);
    expect(parsed.preferences.remotePreference).toBe("flexible");
  });

  it("handles raw CV parsing without id and assigns stable IDs", () => {
    // This simulates raw output from Gemini where bullets and experience do not have id fields
    const rawFromGemini = {
      contact: {
        name: "Tunde Dev",
        email: "tunde@example.com",
      },
      summary: "Software Engineer",
      skills: ["React", "TypeScript"],
      experience: [
        {
          company: "Tech Co",
          role: "Engineer",
          startDate: "2020",
          bullets: [{ text: "Built great products" }, { text: "Led engineering team" }],
        },
      ],
      projects: [
        {
          name: "Project Alpha",
          bullets: [{ text: "High performance service" }],
        },
      ],
      education: [
        {
          institution: "University",
          degree: "B.Sc.",
        },
      ],
    };

    const stabilized = ensureStableIds(rawFromGemini);
    expect(stabilized.experience[0].id).toBeTruthy();
    expect(stabilized.experience[0].bullets[0].id).toBeTruthy();
    expect(stabilized.experience[0].bullets[1].id).toBeTruthy();
    expect(stabilized.projects[0].id).toBeTruthy();
    expect(stabilized.projects[0].bullets[0].id).toBeTruthy();
    expect(stabilized.education[0].id).toBeTruthy();
  });

  it("SaveProfileSchema rejects an empty profile missing name or email", () => {
    const emptyProfile = {
      contact: {
        name: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      skills: [],
      experience: [],
      projects: [],
      education: [],
    };

    const result = SaveProfileSchema.safeParse(emptyProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Full name is required");
      expect(messages).toContain("A valid email address is required");
    }
  });

  it("SaveProfileSchema rejects invalid email formats", () => {
    const invalidEmailProfile = {
      contact: {
        name: "Dev Lagos",
        email: "not-an-email",
      },
    };

    const result = SaveProfileSchema.safeParse(invalidEmailProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/valid email/i);
    }
  });

  it("assigns stable IDs when missing without mutating existing IDs", () => {
    const existingBulletId = "bullet-existing-123";
    const existingProjectId = "project-existing-456";

    const raw = {
      contact: {
        name: "Dev Lagos",
        email: "dev@example.com",
        phone: "+2348012345678",
        location: "Lagos, Nigeria",
      },
      summary: "Full-stack engineer",
      skills: ["React"],
      experience: [
        {
          id: "",
          company: "Acme Corp",
          role: "Senior Engineer",
          startDate: "Jan 2022",
          endDate: "Present",
          bullets: [
            { id: existingBulletId, text: "Built microservices" },
            { id: "", text: "Reduced latency by 40%" },
          ],
        },
      ],
      projects: [
        {
          id: existingProjectId,
          name: "OpenSource Tool",
          description: "Developer CLI tool",
          technologies: ["Node.js"],
          bullets: [{ id: "", text: "Reached 1k GitHub stars" }],
        },
      ],
    };

    const stabilized = ensureStableIds(raw);

    // Existing IDs must be preserved
    expect(stabilized.experience[0].bullets[0].id).toBe(existingBulletId);
    expect(stabilized.projects[0].id).toBe(existingProjectId);

    // Empty IDs must be generated
    expect(stabilized.experience[0].id).toBeTruthy();
    expect(stabilized.experience[0].id.length).toBeGreaterThan(10);
    expect(stabilized.experience[0].bullets[1].id).toBeTruthy();
    expect(stabilized.experience[0].bullets[1].id).not.toBe(existingBulletId);
    expect(stabilized.projects[0].bullets[0].id).toBeTruthy();
  });
});
