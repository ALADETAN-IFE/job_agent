import { AiPipeline, CoverLetter, JobAnalysis, JobInput, TailoredCv } from "./index";
import { Profile, ensureStableIds } from "@/lib/profile/schema";
import sampleProfileFixture from "../../../fixtures/profile.json";

export class MockAiPipeline implements AiPipeline {
  async parseCv(cvText: string): Promise<Profile> {
    if (!cvText || cvText.trim().length === 0) {
      throw new Error("CV text is empty or invalid");
    }

    // Return stabilized fixture data
    return ensureStableIds(sampleProfileFixture);
  }

  async analyzeJob(profile: Profile, job: JobInput): Promise<JobAnalysis> {
    void job;
    const requiredSkills = ["TypeScript", "Next.js", "PostgreSQL", "Docker", "GraphQL"];
    const niceToHaveSkills = ["Kubernetes", "AWS", "Python"];
    const keywords = ["fintech", "microservices", "high throughput", "REST"];

    const profileSkillsSet = new Set(profile.skills.map((s) => s.toLowerCase()));

    const matched = requiredSkills.filter((s) => profileSkillsSet.has(s.toLowerCase()));
    const gaps = requiredSkills.filter((s) => !profileSkillsSet.has(s.toLowerCase()));

    const matchScore = Math.round((matched.length / requiredSkills.length) * 100);

    return {
      requiredSkills,
      niceToHaveSkills,
      keywords,
      matchScore,
      matched,
      gaps,
    };
  }

  async tailorCv(
    profile: Profile,
    job: JobInput,
    analysis: JobAnalysis
  ): Promise<TailoredCv> {
    void job;
    void analysis;
    return {
      summary: profile.summary,
      skills: profile.skills.slice(0, 10),
      experience: profile.experience.map((exp) => ({
        sourceId: exp.id,
        bullets: exp.bullets.map((b) => ({
          sourceId: b.id,
          text: b.text,
        })),
      })),
      projects: profile.projects.map((proj) => ({
        sourceId: proj.id,
        bullets: proj.bullets.map((b) => ({
          sourceId: b.id,
          text: b.text,
        })),
      })),
    };
  }

  async writeCoverLetter(
    profile: Profile,
    job: JobInput,
    analysis: JobAnalysis,
    toneSample?: string
  ): Promise<CoverLetter> {
    void analysis;
    void toneSample;
    return {
      body: `Dear Hiring Team at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} role. With my background as a full-stack engineer in Lagos and extensive experience building high-throughput services with TypeScript and cloud architectures, I am confident in delivering immediate value to your engineering team.\n\nSincerely,\n${profile.contact.name}`,
    };
  }
}

export const mockAi = new MockAiPipeline();
