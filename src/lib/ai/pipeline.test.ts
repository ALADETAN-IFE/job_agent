import { describe, it, expect } from "vitest";
import { mockAi } from "./mock";
import { ProfileSchema } from "@/lib/profile/schema";

describe("AiPipeline parseCv (Mock Pipeline)", () => {
  it("rejects empty CV text", async () => {
    await expect(mockAi.parseCv("")).rejects.toThrow("CV text is empty or invalid");
    await expect(mockAi.parseCv("   ")).rejects.toThrow("CV text is empty or invalid");
  });

  it("parses valid CV text into a fully validated Profile with stable IDs", async () => {
    const profile = await mockAi.parseCv("Sample extracted CV text");

    // Must validate through ProfileSchema
    const validated = ProfileSchema.parse(profile);
    expect(validated.contact.name).toBe("Tunde Adebayo");
    expect(validated.skills.length).toBeGreaterThan(0);
    expect(validated.experience.length).toBeGreaterThan(0);

    // Every experience bullet must have an ID
    for (const exp of validated.experience) {
      expect(exp.id).toBeTruthy();
      for (const bullet of exp.bullets) {
        expect(bullet.id).toBeTruthy();
      }
    }

    // Every project must have an ID
    for (const proj of validated.projects) {
      expect(proj.id).toBeTruthy();
      for (const bullet of proj.bullets) {
        expect(bullet.id).toBeTruthy();
      }
    }
  });
});
