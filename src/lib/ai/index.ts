import { GoogleGenAI } from "@google/genai";
import { Profile, ensureStableIds } from "@/lib/profile/schema";
import { PARSE_CV_SYSTEM_PROMPT, createParseCvPrompt } from "./prompts";
import { MockAiPipeline, mockAi } from "./mock";
import { createLogger } from "@/lib/logger";

const log = createLogger("ai");

export type JobInput = { title: string; company: string; description: string };

export type JobAnalysis = {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  keywords: string[];
  matchScore: number; // 0-100
  matched: string[];  // skills/keywords found in the profile
  gaps: string[];     // skills/keywords NOT in the profile (never hidden)
};

export type TailoredBullet = {
  text: string;
  sourceId: string; // id of the profile bullet this came from
};

export type TailoredCv = {
  summary: string;
  skills: string[]; // subset of profile skills only
  experience: { sourceId: string; bullets: TailoredBullet[] }[];
  projects: { sourceId: string; bullets: TailoredBullet[] }[];
};

export type CoverLetter = { body: string };

export interface AiPipeline {
  parseCv(cvText: string): Promise<Profile>;
  analyzeJob(profile: Profile, job: JobInput): Promise<JobAnalysis>;
  tailorCv(profile: Profile, job: JobInput, analysis: JobAnalysis): Promise<TailoredCv>;
  writeCoverLetter(
    profile: Profile,
    job: JobInput,
    analysis: JobAnalysis,
    toneSample?: string
  ): Promise<CoverLetter>;
}

export interface GenAiClientLike {
  interactions: {
    create(params: {
      model: string;
      system_instruction?: string;
      input?: string;
      store?: boolean;
      response_format?: { mime_type?: string; mimeType?: string; [k: string]: unknown };
      [key: string]: unknown;
    }): Promise<{ output_text?: string; [key: string]: unknown }>;
  };
}

export class GeminiAiPipeline implements AiPipeline {
  private client: GenAiClientLike;
  private model: string;

  constructor(client?: GenAiClientLike, model?: string) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.client = client || (new GoogleGenAI({ apiKey }) as unknown as GenAiClientLike);
    this.model = model || process.env.GEMINI_MODEL || "gemini-3.5-flash";
  }

  async parseCv(cvText: string): Promise<Profile> {
    if (!cvText || cvText.trim().length === 0) {
      throw new Error("CV text is empty or invalid");
    }

    log.info("parseCv started", { model: this.model });

    const runCall = async (promptText: string) => {
      // NON-NEGOTIABLE PRIVACY REQUIREMENT: store: false must always be set
      const response = await this.client.interactions.create({
        model: this.model,
        system_instruction: PARSE_CV_SYSTEM_PROMPT,
        input: promptText,
        store: false,
        response_format: { type: "text", mime_type: "application/json" },
      });

      const text = response.output_text || "";
      return JSON.parse(text);
    };

    let rawJson: unknown;
    try {
      rawJson = await runCall(createParseCvPrompt(cvText));
      log.info("parseCv succeeded on first attempt");
      return ensureStableIds(rawJson);
    } catch (firstError) {
      const errorType = firstError instanceof Error ? firstError.name : "UnknownError";
      const errorMessage = firstError instanceof Error ? firstError.message : "Unknown error";
      log.warn("parseCv first attempt failed, retrying", { errorType, errorMessage });
      // Retry once with error correction guidance
      try {
        const retryPrompt = `${createParseCvPrompt(cvText)}\n\nIMPORTANT: The previous output failed JSON validation. Please return strictly valid JSON conforming to the Profile schema without errors.`;
        rawJson = await runCall(retryPrompt);
        log.info("parseCv succeeded on retry");
        return ensureStableIds(rawJson);
      } catch (retryError) {
        const errorType = retryError instanceof Error ? retryError.name : "UnknownError";
        const errorMessage = retryError instanceof Error ? retryError.message : "Unknown error";
        log.error("parseCv failed after retry", { errorType, errorMessage });
        throw new Error(
          `Failed to parse CV with Gemini after retry: ${errorMessage}`
        );
      }
    }
  }

  async analyzeJob(profile: Profile, job: JobInput): Promise<JobAnalysis> {
    // Phase 1 implementation placeholder; forwards to mock during Phase 0
    return mockAi.analyzeJob(profile, job);
  }

  async tailorCv(
    profile: Profile,
    job: JobInput,
    analysis: JobAnalysis
  ): Promise<TailoredCv> {
    // Phase 1 implementation placeholder; forwards to mock during Phase 0
    return mockAi.tailorCv(profile, job, analysis);
  }

  async writeCoverLetter(
    profile: Profile,
    job: JobInput,
    analysis: JobAnalysis,
    toneSample?: string
  ): Promise<CoverLetter> {
    // Phase 1 implementation placeholder; forwards to mock during Phase 0
    return mockAi.writeCoverLetter(profile, job, analysis, toneSample);
  }
}

export function createAiPipeline(): AiPipeline {
  if (
    process.env.USE_AI_MOCKS === "true" ||
    !process.env.GEMINI_API_KEY ||
    process.env.NODE_ENV === "test"
  ) {
    log.info("using mock AI pipeline");
    return mockAi;
  }
  log.info("using Gemini AI pipeline");
  return new GeminiAiPipeline();
}

export const ai: AiPipeline = createAiPipeline();
export { MockAiPipeline, mockAi };
